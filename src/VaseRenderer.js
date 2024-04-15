import { Evaluator, Operation, OperationGroup, SUBTRACTION } from 'three-bvh-csg'
import { Settings } from '../settings.js'
import { CylinderGeometry, SphereGeometry } from 'three'
import { getMaterial } from './getMaterial.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

export class VaseRenderer {

    baseGeometry = null
    extrusionGeometry = null
    holes = []
    renderedFinalGeometry = null

    oldSettings = null
    settings = null

    constructor(scene, camera, renderer, controls) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.controls = controls
        this.settings = { ...Settings }
        this.oldSettings = { ...Settings }

        this.evaluator = new Evaluator()
        this.evaluator.attributes = ['position', 'normal']
        this.evaluator.useGroups = true

        this.material = getMaterial(this.settings)

        this.gui = new GUI()
        this.setupGUI()
    }

    setupGUI() {
        const cylinderFolder = this.gui.addFolder('Cylinder')
        cylinderFolder.add(Settings, 'cylinderWidth', 1, 100).name('cylinderWidth').onChange(v => {
            console.log('cylinderWidth', v)
            this.settings = { ...Settings, cylinderWidth: v }
            // TODO : https://github.com/josdirksen/learning-threejs/blob/master/chapter-05/06-basic-3d-geometries-cylinder.html#L65

            console.log('generateCylinder', this.settings.cylinderWidth, this.oldSettings.cylinderWidth)

            this.update()
        })

        const sphereFolder = this.gui.addFolder('sphere')
        sphereFolder.add(Settings, 'sphereRadius', 1, 100).name('sphereRadius').onChange(v => {
            console.log('sphereRadius', v)

            // for(let hole of holes){
            //     hole.geometry.parameters.radius = v
            // }
        })
    }

    generateBaseGeometries() {
        if (!this.baseGeometry) {
            this.baseGeometry = new CylinderGeometry(this.settings.cylinderWidth, this.settings.cylinderWidth, this.settings.cylinderHeight, this.settings.cylinderSegment)
            this.extrusionGeometry = new SphereGeometry(this.settings.sphereRadius, this.settings.sphereSegment, this.settings.sphereSegment)

        } else {
            this.baseGeometry.dispose()
            this.extrusionGeometry.dispose()
            this.baseGeometry = new CylinderGeometry(this.settings.cylinderWidth, this.settings.cylinderWidth, this.settings.cylinderHeight, this.settings.cylinderSegment)
            this.extrusionGeometry = new SphereGeometry(this.settings.sphereRadius, this.settings.sphereSegment, this.settings.sphereSegment)
        }
    }

    makeHolesOperations(geometry, material, settings) {
        const didSettingsChange = Object.keys(settings).some(key => settings[key] !== this.oldSettings[key])

        if (didSettingsChange) {
            console.log('settings changed')
            this.holes = []
        }

        if (!this.holes.length) {
            const radiusOffset = settings.verticalRadiusOffset

            for (let j = 0; j < settings.layerCount; j++) {
                for (let i = 0; i < settings.sphereCount; i++) {
                    const angle = (i / settings.sphereCount) * 2 * Math.PI + radiusOffset * j
                    const x = settings.cylinderWidth * Math.cos(angle) * settings.sphereOffset
                    const z = settings.cylinderWidth * Math.sin(angle) * settings.sphereOffset

                    const y = settings.cylinderHeight / settings.layerCount * j * 2 * settings.verticalLayerOffset - settings.cylinderHeight / 2 - settings.bottomOffset

                    const hole = new Operation(geometry.clone(), material)
                    hole.position.set(x, y, z)
                    hole.operation = SUBTRACTION

                    this.holes.push(hole)
                }
            }
        }
    }

    processOperations() {
        const root = new Operation(this.baseGeometry, this.material)

        const operationGroup = new OperationGroup()
        operationGroup.add(...this.holes)

        root.add(operationGroup)

        return root
    }

    update() {
        const startTime = performance.now()
        this.generateBaseGeometries()
        const endTime1 = performance.now()
        console.log('generateBaseGeometries', endTime1 - startTime, 'ms')
        this.makeHolesOperations(this.extrusionGeometry, this.material, this.settings)
        const endTime2 = performance.now()
        console.log('makeHolesOperations', endTime2 - startTime, 'ms')
        const root = this.processOperations()
        const endTime3 = performance.now()
        console.log('processOperations', endTime3 - startTime, 'ms')

        if (this.renderedFinalGeometry) {
            this.scene.remove(this.renderedFinalGeometry)
            this.renderedFinalGeometry.geometry.dispose()
        }
        this.renderedFinalGeometry = this.evaluator.evaluateHierarchy(root)
        this.renderedFinalGeometry.material = this.material
        this.scene.add(this.renderedFinalGeometry)

        this.oldSettings = {...this.settings}
    }

}
