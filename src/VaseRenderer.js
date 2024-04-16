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
    isUpdating = false

    constructor(scene, camera, renderer, controls, stats) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.controls = controls
        this.stats = stats
        this.settings = { ...Settings }
        this.oldSettings = { ...Settings }

        this.evaluator = new Evaluator()
        this.evaluator.attributes = ['position', 'normal']
        this.evaluator.useGroups = false

        this.material = getMaterial(this.settings)

        this.gui = new GUI()
        this.setupGUI()
    }

    setupGUI() {
        const base = this.gui.addFolder('base')

        const innerUpdate = () => {
            if (this.isUpdating) return
            this.update()
        }

        base.add(Settings, 'cylinderSegment', 12, 100).name('segments').onChange(v => {
            this.settings = { ...Settings, cylinderSegment: v }
            innerUpdate()
        })
        base.add(Settings, 'sphereSegment', 12, 100).name('segments').onChange(v => {
            this.settings = { ...Settings, sphereSegment: v }
            innerUpdate()
        })

        const cylinderFolder = this.gui.addFolder('Cylinder')
        cylinderFolder.add(Settings, 'cylinderWidth', 20, 40).name('cylinderWidth').onChange(v => {
            this.settings = { ...Settings, cylinderWidth: v }
            // TODO : https://github.com/josdirksen/learning-threejs/blob/master/chapter-05/06-basic-3d-geometries-cylinder.html#L65
            innerUpdate()
        })

        const sphereFolder = this.gui.addFolder('sphere')
        sphereFolder.add(Settings, 'sphereRadius', 20, 100).name('sphereRadius').onChange(v => {
            console.log('sphereRadius', v)

            this.settings = { ...Settings, sphereRadius: v }
            innerUpdate()
        })
        sphereFolder.add(Settings, 'sphereOffset', 1, 3).name('sphereOffset').onChange(v => {
            console.log('sphereOffset', v)

            this.settings = { ...Settings, sphereOffset: v }
            innerUpdate()
        })
        sphereFolder.add(Settings, 'sphereCount', 4, 20).name('sphereCount').onChange(v => {
            console.log('sphereCount', v)

            this.settings = { ...Settings, sphereCount: v }
            innerUpdate()
        })
        sphereFolder.add(Settings, 'verticalLayerOffset', 1, 3).name('verticalLayerOffset').onChange(v => {
            console.log('verticalLayerOffset', v)

            this.settings = { ...Settings, verticalLayerOffset: v }
            innerUpdate()
        })
        sphereFolder.add(Settings, 'verticalRadiusOffset', 1, 2).name('verticalRadiusOffset').onChange(v => {
            console.log('verticalRadiusOffset', v)

            this.settings = { ...Settings, verticalRadiusOffset: v }
            innerUpdate()
        })
    }

    generateBaseGeometries() {
        if (this.baseGeometry) this.baseGeometry.dispose()
        if (this.extrusionGeometry) this.extrusionGeometry.dispose()
        this.baseGeometry = new CylinderGeometry(this.settings.cylinderWidth, this.settings.cylinderWidth, this.settings.cylinderHeight, this.settings.cylinderSegment)
        this.extrusionGeometry = new SphereGeometry(this.settings.sphereRadius, this.settings.sphereSegment, this.settings.sphereSegment)
    }

    makeHolesOperations(geometry, material, settings) {
        this.holes = []

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
        if (this.isUpdating) return

        this.isUpdating = true
        const startTime = performance.now()
        this.generateBaseGeometries()
        const endTime1 = performance.now()
        // console.log('generateBaseGeometries', endTime1 - startTime, 'ms')
        this.makeHolesOperations(this.extrusionGeometry, this.material, this.settings)
        const endTime2 = performance.now()
        // console.log('makeHolesOperations', endTime2 - startTime, 'ms')
        const root = this.processOperations()
        const endTime3 = performance.now()
        // console.log('processOperations', endTime3 - startTime, 'ms')

        if (this.renderedFinalGeometry) {
            this.scene.remove(this.renderedFinalGeometry)
            this.renderedFinalGeometry.geometry.dispose()
        }
        // TODO : use target in evaluateHierarchy?
        this.renderedFinalGeometry = this.evaluator.evaluateHierarchy(root)
        this.renderedFinalGeometry.material = this.material
        this.scene.add(this.renderedFinalGeometry)

        this.oldSettings = { ...this.settings }
        this.isUpdating = false
        console.log('render done')
    }

}
