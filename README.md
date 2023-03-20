## Polyline 3D

A lite weight library created for drawing polyline which is consist of multiple points in WebGL.

### [Online Demo](https://kaygnas.github.io/polyline-3d/)

[Source code could be found here.](https://github.com/KaygNas/polyline-3d/tree/main/playground)


### Installation
```
npm i kaygnas-polyline-3d gl-matrix
```

Caution: `gl-matrix` is a peerDependency, please make sure to install it. 

### Usage

Create a `Dot`. `Dot` is the basic element of a polyline, a dot has four properties `x`, `y`, `size`, `depth`.
```ts
import { Dot } from 'kaygnas-polyline-3d'
const dot = new Dot(
  0.0, // x position of dot
  0.0, // y position of dot
  0.01, // size of dot, determine the width of line
  0.01, // depth of dot, determine the depth of line in z direction
)
```

Create a list of dots could be easy using `Dot.fromValue`:
```ts
import { Dot } from 'kaygnas-polyline-3d'
const dots = [
  // the outline of a triangle
  [-0.1, -0.1, 0.01, 0.01],
  [0.0, 0.1, 0.02, 0.02],
  [0.1, 0.1, 0.03, 0.03],
  [-0.1, -0.1, 0.01, 0.01],
].map(Dot.fromValue)
```

Create a `Polyline3DMeshBuilder`. MeshBuilder help to build a list of dot into 3d mesh, which would be render by the `Polyline3DMeshRenderer`(we would talk about how to do that later).
```ts
import { Polyline3DMeshBuilder } from 'kaygnas-polyline-3d'
const builder = new Polyline3DMeshBuilder(
  dots, // dots to build
  {
    smooth: true, // whether to soomth the line of dots
    interpolationCount: 20, // if smooth is on, interpolationCount determine how smooth the line would be. The bigger interpolationCount is, the smoother the line would be.
  }
)
```

Create a `Polyline3DMeshRenderer`. MeshRenderer help to render the mesh. Also, MeshRenderer control how the light of scene would be and where the camera is.
```ts
import { Polyline3DMeshRenderer } from 'kaygnas-polyline-3d'
const renderer = new Polyline3DMeshRenderer(canvasElement)
renderer.setMeshs(builder.build()) // set the meshs to render.
renderer.render() // render the meshs.
```

Change the light of scene or the position of camera. 
```ts
import { vec3 } from 'gl-matrix'
render.lightPosition = vec3.fromValues(0.0, 0.0, 1.0) // set the position of light, the light source is just a spot.
renderer.lightColor = vec3.fromValues(1.0, 0.0, 0.0) // set the color of the light, in this line it is set to red.
renderer.ambientLight = vec3.fromValues(0.0, 0.0, 0.4) // set the ambient light of the scene, in this line it is set to dark blue.
renderer.eye = vec3.fromValues(-0.5, 0.0, 1.0) // set the position of camera.
```

Create a `MouseTracker`. MouseTracker help to track the movement of mouse, therefore we could transform the polyline as we want.
It is helpful when requirement of making the line interactive is met. Normaliy, it is used to rotate the line.
```ts
import { MouseTracker } from 'kaygnas-polyline-3d'
import { mat4 } from 'gl-matrix'
const controler = new MouseTracker({
  traget: canvasElement,
  onTrack: (e) => {
    const sensitivity = 0.02
    const rotation = { x: e.movementY * sensitivity, y: e.movementX * sensitivity }
    const rotateMat = mat4.create() // create a rotateMatrix to transform the line.
    mat4.rotateX(rotateMat, rotateMat, rotation.x)
    mat4.rotateY(rotateMat, rotateMat, rotation.y)
    mat4.multiply(renderer.modelMat, rotateMat, renderer.modelMat) // apply the rotateMatrix to modelMatrix.
    renderer.render()
  },
})
controler.enable() // Do not forget to enable the controler. By the way, to disable just call `controler.disable()`.
```

That's all. It might be difficult to understand what's going on with the `vec3` and `mat4`, here's some reference which might help.

- [gl-matrix](https://github.com/toji/gl-matrix)
- [webgl-3d-camera](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html)