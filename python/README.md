# Tracing Example

This is slightly modified version of [fast neural style example](https://github.com/pytorch/examples/tree/master/fast_neural_style) from pytorch repo.

Run `python download_saved_models.py` to download pre-trained models.

Run `python neural_style.py eval --content-image image_244_244.jpg --model saved_models\candy.pth --cuda 0 --export_jit candy_224_224.pt  --output-image out.jpg` to trace a pre-trained model (`candy.pth`) into `candy_224_224.pt` that can be used with nodejs script.



