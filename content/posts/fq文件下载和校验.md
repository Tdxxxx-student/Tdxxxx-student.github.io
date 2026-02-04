+++
date = '2026-02-03T22:20:24+08:00'
draft = false
title = 'Fq文件下载和校验'
categories = ["fq文件下载"]
tags = ["fastq下载"]
+++
# Aspera安装
可以conda/mamba安装
[Linux系统上安装aspera并用其批量高速下载转录组数据 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/640962215)
手动安装

```bash
wget https://ak-delivery04-mul.dhe.ibm.com/sar/CMA/OSA/09cne/0/ibm-aspera-connect-3.11.0.5-linux-g2.12-64.tar.gz
tar -zxvf ibm-aspera-connect-3.11.0.5-linux-g2.12-64.tar.gz
## sh文件上一步解压生成的
./ibm-aspera-connect-3.11.0.5-linux-g2.12-64.sh
# 把USERNAME 换成自己的linux 账户名
$ echo """export PATH=\"/home/xiaotiancai/.aspera/connect/bin:\$PATH\" """ >> ~/.bashrc
```
```bash
# 有输出帮助文档则安装成功
$ ascp -h
```

## 基本语法
借鉴
[Aspera ascp Usage (2.7) Documentation - All Aspera Server 2.7 Platforms (asperasoft.com)](https://download.asperasoft.com/download/docs/ascp/2.7/html/index.html)

基本语法如下，`[OPTION]` 是参数设置，`SRC` 是远程资源路径，`DEST`是文件保存路径。若`SRC`为多个文件，则保存在`DEST`目录下。

```bash
ascp [OPTION] SRC... DEST
```

参数 说明     
```
-l 最大传输速率  

 ==-i 密钥地址，自己安装都是：~/.aspera/connect/etc/asperaweb_id_dsa.openssh== ，conda安装参照上面内容   

-P -P33001，分开合起作用都是一样。设成其他可能会要输密码。Set the TCP port used for fasp session initiation. (Default: 22)   

-Q Enable fair transfer policy  

-k -k2, 分开合起作用都是一样,异常中断可以重启。Enables fatal transfer restarts.  

-T 禁止加密。Disable encryption for maximum throughput.   

SRC 位置参数，源文件地址，类似[era-fasp@fasp.sra.ebi.ac.uk](https://links.jianshu.com/go?to=mailto%3Aera-fasp%40fasp.sra.ebi.ac.uk):/vol1/fastq/SRR576/004/SRR5760814/SRR5760814.fastq.gz  

DEST ./test.fq.gz， 保存地址
```

```
# 以一个例子作为说明
ascp  -l 100M -P 33001 -QT -k 2 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh era-fasp@fasp.sra.ebi.ac.uk:/vol1/fastq/SRR576/004/SRR5760814/SRR5760814.fastq.gz ./test.fq.gz
```

## 下载
```bash
$ ascp -l 100M -P 33001 -QT -k 2 -i ~/.aspera/connect/etc/asperaweb_id_dsa.openssh era-fasp@fasp.sra.ebi.ac.uk:/vol1/fastq/SRR576/002/SRR5760812/SRR5760812.fastq.gz ./test.fq.gz
```

师姐解说
```bash
WH:
 mamba activate ascp
WH:
which aspera
WH:
#密钥地址一般是bin换成etc后边
```

在SRA可以直接获取格式
```bash
xtc424密钥：/pub/software/miniforge3/envs/ascp/etc/asperaweb_id_dsa.openssh
```

==nohup挂载后台运行脚本==

```bash
nohub command &
# 按任意键如回车键
# 正常退出，否则可能会失败
exit
```
# ENA自动下载校验脚本
直接在 [ENA](https://www.ebi.ac.uk/ena/browser/view/) 上检索想要下载的数据
有两个信息很重要，MD5值和Aspera链接，第一列为run accession。
选择TSV下载格式将信息下载下来，然后使用R进行处理，获得最终要的数据格式。R代码如下：
## R 处理成最后想要的格式
```r
rm(list = ls())
setwd("tsv文件所在路径")  
library(tidyverse)

# 获取当前目录的文件列表
dir() %>% 
  as.data.frame() %>% 
  magrittr::set_names("file") %>%
  dplyr::filter(grepl("\\.tsv$|\\.txt$", file)) -> df.file  # 筛选特定后缀文件

all.ena <- tibble()

for (i in unique(df.file$file)) {
  readr::read_delim(i, show_col_types = FALSE) %>%   # 直接用文件名
    magrittr::set_names(c("Run", "md5", "link")) %>% 
    dplyr::mutate(
      md5 = stringr::str_split(md5, ";"),
      link = stringr::str_split(link, ";")
    ) %>% 
    tidyr::unnest(cols = c(md5, link)) %>%   # 指定 cols 参数
    dplyr::mutate(
      file = stringr::str_split(link, "/") %>% sapply(`[`, 7)
    ) %>% 
    dplyr::select(Run, file, md5, link) %>% 
    dplyr::bind_rows(all.ena) -> all.ena 
}

# 输出到当前目录
all.ena %>% 
  dplyr::select(file, md5, link) %>% 
  readr::write_delim("ena.info.txt", delim = "\t", col_names = FALSE)
```
得到的文件长这样：
第一列是 fq 文件名，第二列是 MD 5 校验码，第三列是 aspera 下载地址
把这个文件上传到服务器，就可以开始下载了。批量下载代码脚本
```shell
#!/bin/bash  
  
# 定义文件列表的文本文件路径  
FILE_LIST="ena.info.txt"  
  
# 定义最大重试次数  
MAX_RETRIES=10  
  
# 检查文件列表文件是否存在  
if [ ! -f "$FILE_LIST" ]; then  
echo "文件列表文件 $FILE_LIST 不存在。"  
exit 1  
fi  
  
# 读取文件列表文件  
while read -r filename md5sum download_url; do  
echo "处理文件: $filename"  
  
# 定义下载的文件路径  
download_path="$filename"  
  
# 初始化重试次数  
retries=0  
  
# 循环直到文件校验成功或达到最大重试次数  
while [ $retries -lt $MAX_RETRIES ]; do  
echo "尝试下载文件 (尝试次数: $((retries + 1)) / $MAX_RETRIES)..."  
  
# 使用curl下载文件  
#curl -o "$download_path" -L "$download_url"  
# 使用 ascp 下载文件  
# 换成自己的asperaweb_id_dsa.openssh路径  
ascp -QT -l 100m -P33001 -k 1 -i ~/mambaforge/envs/tools4bioinf/etc/asperaweb_id_dsa.openssh era-fasp@$download_url .  
  
# 计算下载文件的MD5校验和  
actual_md5=$(md5sum "$download_path" | awk '{print $1}')  
  
# 校验文件  
if [ "$actual_md5" = "$md5sum" ]; then  
echo "文件 $filename 下载成功，并且MD5校验和正确。"  
break  
else  
echo "文件校验失败，正在重试..."  
rm "$download_path"  
retries=$((retries + 1))  
fi  
done  
  
# 检查是否达到最大重试次数  
if [ $retries -eq $MAX_RETRIES ]; then  
echo "文件 $filename 下载和校验失败，已达到最大重试次数。"  
# exit 1  
fi  
done < "$FILE_LIST"
```

```shell
nohup bash aspera_1.sh > dl.log 2>&1 & 
echo 1646575 > dl.id
```
## 注意
上面脚本需要自行修改下载速度和密钥！

```shell
# 输出日志
处理文件: SRR12976775_1.fastq.gz  
尝试下载文件 (尝试次数: 1 / 10)...  
SRR12976775_1.fastq.gz 100% 1420MB 10.7Mb/s 10:12  
Completed: 1454518K bytes transferred in 612 seconds  
(19438K bits/sec), in 1 file.  
文件 SRR12976775_1.fastq.gz 下载成功，并且MD5校验和正确。
```