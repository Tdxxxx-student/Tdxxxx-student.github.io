+++
date = '2026-02-06T12:41:28+08:00'
author = "tdx"
draft = false
title = 'Fq文件改名脚本'
categories = ["fq文件下载"]
tags = ["fastq","文件改名"]
description = ""
+++
# Linux 数据处理：批量提取文件名并重命名
在生物信息分析中，我们经常需要处理包含样本信息的文本文件，并根据这些信息批量重命名测序数据（FASTQ 文件）。

本文介绍如何使用 awk 提取文件名中的特定字段，并批量重命名对应的测序文件。

场景描述
假设我们有一个样本信息文件 sample.txt，内容如下：

text

SRR064551       BGI_CUHK_Soybean_C08
SRR064552       BGI_CUHK_Soybean_C16
SRR064553       BGI_CUHK_Soybean_C17
需求：

提取第二列中最后一个下划线后的内容（例如 C08, C16）作为新样本名。
将对应的测序文件（如 SRR064551_1.fastq.gz）重命名为新名字（如 C08_1.fastq.gz）。
解决方案
## 1. 提取并生成重命名脚本
使用 awk 可以轻松完成字符串分割和命令构造。

```Bash

awk 'NF {
    split($2, a, "_"); 
    new_name = a[length(a)];
    print "mv " $1 "_1.fastq.gz " new_name "_1.fastq.gz";
    print "mv " $1 "_2.fastq.gz " new_name "_2.fastq.gz";
}' sample.txt > rename.sh
```
代码详解：

NF：awk 内置变量，表示“列数”。放在开头 NF { ... } 作为一个判断条件，仅处理非空行。如果不加这个，文件末尾的空行会导致生成错误的 mv _1.fastq.gz 命令。
split($2, a, "_")：将第二列（$2）按 _ 分割，存入数组 a。
a[length(a)]：获取数组 a 的最后一个元素（即我们需要的 C08 等）。
print：构造 mv 命令并输出。
## 2. 检查生成的脚本
在执行之前，务必检查生成的 rename.sh 内容是否正确：

```Bash

cat rename.sh
```
预期输出：

```Bash

mv SRR064551_1.fastq.gz C08_1.fastq.gz
mv SRR064551_2.fastq.gz C08_2.fastq.gz
mv SRR064552_1.fastq.gz C16_1.fastq.gz
mv SRR064552_2.fastq.gz C16_2.fastq.gz
...
```
## 3. 执行重命名
确认无误后，运行脚本：

```Bash

bash rename.sh
```
常见错误排查
问题：生成的脚本包含 mv _1.fastq.gz ...
原因：源文件 sample.txt 末尾包含空行，awk 默认会处理空行，导致变量为空。
解决：如上文所示，在 awk 命令开头添加 NF 或 !/^$/ 来过滤空行。

问题：文件不存在报错
原因：某些样本可能没有下载成功，或者文件名后缀不匹配（比如是 .fq.gz 而不是 .fastq.gz）。
解决：可以在 awk 中增加 if 判断，或者直接忽略报错（mv 找不到文件会提示但不会破坏其他文件）。

```Bash

# 增加文件存在检查的 awk 写法
awk 'NF {
    split($2, a, "_");
    new = a[length(a)];
    print "[ -f "$1"_1.fastq.gz ] && mv "$1"_1.fastq.gz "new"_1.fastq.gz"
}' sample.txt
```
## 总结
利用 awk 的 split 函数和 NF 变量，我们可以快速从复杂的样本表中提取关键信息，并生成安全的批量操作脚本，避免了手动重命名的繁琐和错误。