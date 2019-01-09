# Image Style Transfer with Node.JS 
Demo of image style transfer app based on Node.js and Express 
that uses [neural network model](https://github.com/pytorch/examples/tree/master/fast_neural_style) created and traced with Pytorch.
 
## Usage
Open the site on your mobile or desktop, shoot or upload something, stylize :-)

![Image Style Transfer with Node.js](/docs/screenshot.png?raw=true "Image Style Transfer with Node.js")

Live demo: http://nodejs-style.mooo.com:3000

## Why? 
This app is inspired by Lessons 6 & 9 of [Facebook Pytorch Scholarship](https://www.udacity.com/facebook-pytorch-scholarship).
It shows how easy it is possible to deploy high-performance ML models these days combining 
such popular platforms as Node.js and NPM with newly released Torch Script feature of Pytorch.

Apart from that, Node.js non-blocking I/O seems to be good fit for running NN inference in Worker Pool.

The heavy lifting of image processing is done by [libtorch C++ library](https://pytorch.org/cppdocs/), which is wrapped in Node.js module [libtorchjs](https://www.npmjs.com/package/libtorchjs) 
 created specially for this app to expose some bits of libtorch in JS.  

## Running
Currently the only supported platform is Linux. libtorch does have Windows and Mac variants,
 but these are not included in [libtorchjs](https://www.npmjs.com/package/libtorchjs) yet.

### Linux
Checkout repo, install npm libraries, start app: 
```
$ npm i
$ npm run start
```
Open http://localhost:3000/

### Docker
Checkout repo, build image and run: 
```
$ docker build --tag=nodejs-style-transfer .
$ docker run -P nodejs-style-transfer
```
Open http://localhost:3000/

## How to Add Style
This app has just one style included.  
The easiest way to create more models is to install [`fast_neural_style`](https://github.com/pytorch/examples/tree/master/fast_neural_style) from Pytorch examples 
and add following code in the end of `stylyze` function in
[fast_neural_style/neural_style/neural_style.py](https://github.com/pytorch/examples/blob/master/fast_neural_style/neural_style/neural_style.py#L122): 
```python
traced_script_module = torch.jit.trace(style_model, content_image)
traced_script_module.save("style_model.pt")
```
And after that, execute stylization script on any image and this will write out `style_model.pt`.
Note that traced model will keep the size of your image and will be able to work only with same dimensions.
For this demo app, image size is fairly small (`224x224`) so it's fast even on CPU.

See [libtorch tutorial](https://pytorch.org/tutorials/advanced/cpp_export.html) for more info about model tracing.

## Acknowledgements
 * Inspiration: https://www.udacity.com/facebook-pytorch-scholarship
 * Model: https://github.com/pytorch/examples/tree/master/fast_neural_style
 * Model tracing tutorial: https://pytorch.org/tutorials/advanced/cpp_export.html 
 * Canvas & EXIF helpers: https://stackoverflow.com/a/40867559 https://stackoverflow.com/a/21961894
 * Spinners: https://loading.io/spinner/fidget-spinner

## Disclamer
Note that it's just a toy project and [libtorchjs](https://www.npmjs.com/package/libtorchjs) is too immature to use in production.
