# AI Training Next Steps

The MVP works with OpenCV heuristics and optional model wrappers. Use this checklist when you are ready to improve production accuracy with trained models.

## Dataset Prep

1. Download a floor-plan dataset such as CubiCasa5K or Structured3D.
2. Keep source data outside the repo, for example under `E:\datasets\metanest`.
3. Normalize labels into:
   - YOLO boxes for doors and windows
   - segmentation masks for room classes
4. Use the synthetic assets in `docs/demo-assets/dummy_raw` only for smoke tests, not for production training.

## Door And Window Detection

Prepare the YOLO dataset:

```bash
cd backend
python scripts/preprocess_cubicasa_openings.py --images E:\datasets\metanest\images --labels E:\datasets\metanest\labels --output data\openings
```

Train YOLOv8:

```bash
python scripts/train_yolo_openings.py --data data\openings\dataset.yaml --epochs 80
```

Run a single-image inference check:

```bash
python scripts/infer_yolo_openings.py --image path\to\sample.png --model runs\metanest-openings\floor-plan-symbols\weights\best.pt
```

## Room Segmentation

Train the U-Net room segmenter:

```bash
cd backend
python scripts/train_unet_rooms.py --images E:\datasets\metanest\images --masks E:\datasets\metanest\masks --output models\unet_rooms.pt
```

Run a single-image inference check:

```bash
python scripts/infer_unet_rooms.py --image path\to\sample.png --model models\unet_rooms.pt --output room_mask.png
```

## Enable Models

Set these values in `backend/.env` after training:

```env
YOLO_OPENING_MODEL_PATH=runs/metanest-openings/floor-plan-symbols/weights/best.pt
UNET_ROOM_MODEL_PATH=models/unet_rooms.pt
```

Then rerun:

```bash
cd backend
pytest
```

Use real floor-plan uploads to compare model output against the OpenCV fallback before deploying.
