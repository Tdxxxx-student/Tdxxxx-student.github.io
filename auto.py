import subprocess
import sys
from datetime import datetime

def auto_push():
    # 1. 构建 Hugo
    print("构建 Hugo...")
    subprocess.run(["hugo", "--cleanDestinationDir"], check=True)
    
    # 2. 添加文件
    subprocess.run(["git", "add", "."])
    
    # 3. 检查是否有更改
    result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    if not result.stdout.strip():
        print("✓ 没有更改，已是最新状态")
        return
    
    # 4. 提交并推送
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    subprocess.run(["git", "commit", "-m", f"update: {now}"], check=True)
    subprocess.run(["git", "push", "origin", "main"], check=True)
    print("✓ 推送完成！")

if __name__ == "__main__":
    auto_push()