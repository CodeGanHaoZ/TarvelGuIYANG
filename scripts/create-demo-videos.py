"""Optional asset regeneration: pip install imageio-ffmpeg (wheel only).

Creates silent MP4 slideshow fixtures from existing licensed-for-demo photos.
No real social video is downloaded; captions and creators are fictional.
"""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
# Build-only tooling is outside the application dependencies.
sys.path.insert(0, str(root / 'work' / 'video-tools'))
import imageio_ffmpeg

encoder = imageio_ffmpeg.get_ffmpeg_exe()
out = root / 'public' / 'videos'
out.mkdir(exist_ok=True)
clips = {
    'guizhou-demo': [('xiaoqikong', '第一站：荔波小七孔'), ('xijiang', '第二站：西江千户苗寨'), ('jiaxiu', '第三站：甲秀楼')],
    'waterfall-demo': [('huangguoshu', '安顺：黄果树瀑布'), ('xiaoqikong', '荔波：小七孔')],
}
for name, images in clips.items():
    args = [encoder, '-y', '-hide_banner', '-loglevel', 'error']
    for image, _ in images:
        args += ['-loop', '1', '-t', '3', '-i', str(root / 'public' / 'images' / (image + '.jpg'))]
    filters = [f'[{i}:v]scale=540:960:force_original_aspect_ratio=increase,crop=540:960,setsar=1,fps=24,format=yuv420p[v{i}]' for i in range(len(images))]
    filters += [''.join(f'[v{i}]' for i in range(len(images))) + f'concat=n={len(images)}:v=1:a=0[out]']
    args += ['-filter_complex', ';'.join(filters), '-map', '[out]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '27', '-an', '-movflags', '+faststart', str(out / (name + '.mp4'))]
    subprocess.run(args, check=True)
    text = 'WEBVTT\n\n' + '\n\n'.join(f'00:00:{i*3:02d}.000 --> 00:00:{(i+1)*3:02d}.000\n{caption}（Mock 分镜）' for i, (_, caption) in enumerate(images)) + '\n'
    (out / (name + '.vtt')).write_text(text, encoding='utf-8')
    print(name, (out / (name + '.mp4')).stat().st_size)
