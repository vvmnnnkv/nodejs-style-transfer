// express
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

// image processing
const torch = require('libtorchjs');
const jpeg = require('jpeg-js');

// style models path
// todo move to config
const path = require('path');
const modelsFolder = path.join(path.dirname(__dirname), 'models');
// just one model for now
const models = {
    'candy_224_224': {
        'width': 224,
        'height': 224,
        'file': 'candy_224_224.pt'
    }
};

// upload route
router.post('/upload', upload.single('image'), function (req, res) {
    if (req.body && req.body.image) {
        // todo pass param to select the model
        const model = models['candy_224_224'];
        // image is base64-encoded jpeg
        const img = dataUriToBuffer(req.body.image);
        applyStyle(img, path.join(modelsFolder, model.file), model.width, model.height, function (err, output) {
            if (err) {
                res.writeHead(500);
                return res.end(err.message);
            }
            res.send(bufferToDataUri(output, 'image/jpeg'));
        });
    } else {
        res.writeHead(400);
        res.end('No image submitted');
    }
});

module.exports = router;

function jpegToTensor(jpegData) {
    const img = jpeg.decode(jpegData);
    const arr = new Float32Array(img.width * img.height * 3);
    const channelSize = img.width * img.height;

    // convert from (width,height,rgba) to (rgb,width,height)
    for (let i = 0; i < channelSize; i++) {
        arr[i] = img.data[i * 4];
        arr[i + channelSize] = img.data[i * 4 + 1];
        arr[i + channelSize * 2] = img.data[i * 4 + 2];
    }
    // initial tensor is flat
    const tensor = torch.tensor(arr);
    // reshape to 1x3xWxH to match model input
    return tensor.view([1, 3, img.width, img.height]);
}

function tensorToJpeg(tensor, width, height, quality = 90) {
    const arr = tensor.toUint8Array();
    const img = Buffer.alloc(width * height * 4);
    const i = 0;
    const channelSize = width * height;

    // convert from (rgb, width, height) to (width, height, rgba)
    for (let i = 0; i < channelSize; i++) {
        img[i * 4] = arr[i]; // red
        img[i * 4 + 1] = arr[i + channelSize]; // green
        img[i * 4 + 2] = arr[i + channelSize * 2]; // blue
        img[i * 4 + 3] = 0xFF; // alpha - ignored
    }
    const rawImageData = {
        data: img,
        width: width,
        height: height
    };
    const jpegImageData = jpeg.encode(rawImageData, quality);
    return jpegImageData.data;
}

function applyStyle(img, modelFile, width, height, cb) {
    const input = jpegToTensor(img);
    torch.load(modelFile, function (err, model) {
        if (err) return cb(err);
        // pass the image data to model
        model.forward(input, function (err, result) {
            if (err) return cb(err);
            // convert to jpeg and return
            const jpg = tensorToJpeg(result, width, height);
            cb(null, jpg);
        });
    });
}

function dataUriToBuffer(dataURI) {
    return Buffer.from(dataURI.split(',', 2)[1], 'base64');
}

function bufferToDataUri(buffer, mediaType) {
    return 'data:' + mediaType + ';base64,' + buffer.toString('base64');
}
