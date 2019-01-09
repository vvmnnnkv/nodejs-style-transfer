/**
 * Based on https://stackoverflow.com/a/40867559
 */
function createCanvas(img, srcOrientation, w, h) {

    var width = w,
        height = h,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d");

    if (!srcOrientation) {
        canvas.width = width;
        canvas.height = height;
        return ctx;
    }

    // set proper canvas dimensions before transform & export
    if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
    } else {
        canvas.width = width;
        canvas.height = height;
    }

    // transform context before drawing image
    switch (srcOrientation) {
        case 2:
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;
        case 3:
            ctx.transform(-1, 0, 0, -1, width, height);
            break;
        case 4:
            ctx.transform(1, 0, 0, -1, 0, height);
            break;
        case 5:
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
        case 6:
            ctx.transform(0, 1, -1, 0, height, 0);
            break;
        case 7:
            ctx.transform(0, -1, -1, 0, height, width);
            break;
        case 8:
            ctx.transform(0, -1, 1, 0, 0, width);
            break;
        default:
            break;
    }
    return ctx;
}

/**
 * https://stackoverflow.com/a/21961894
 */
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

/**
 * Get first uploaded image as data URI
 */
function getImageData(fileList) {
    let file = null;

    for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].type.match(/^image\//)) {
            file = fileList[i];
            break;
        }
    }

    if (file !== null) {
        return URL.createObjectURL(file)
    }
}

/**
 * Crop/resize & draw the first image in the list
 */
function drawOnCanvas(fileList, width, height, cb) {
    const imgData = getImageData(fileList);
    const imgObj = new Image;
    imgObj.onload = function() {
        // get exif data from image
        EXIF.getData(imgObj, function () {
            // create canvas context transformed accordingly with orientation
            const context = createCanvas(imgObj, imgObj.exifdata.Orientation, width, height);
            // draw image onto canvas scaled/cropped like "object-fit: 'cover'"
            drawImageProp(context, imgObj, 0, 0, width, height);
            // pass context
            cb(context);
        });
    };
    imgObj.src = imgData;
}

function submitCanvas(canvas, url, type, cb) {
    let file = canvas.toDataURL(type);
    let formData = new FormData;
    formData.append('image', file);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            cb(null, xhr.responseText);
        } else {
            cb(new Error(xhr.responseText));
        }
    };
    xhr.timeout = 10000;
    xhr.onerror = function() {
        cb(new Error("Opps! Something failed, please re-try"));
    };
    xhr.send(formData);
}

/**
 * https://stackoverflow.com/a/15832662
 */
function downloadURI(uri, name) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
