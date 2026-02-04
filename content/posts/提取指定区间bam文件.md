+++
date = '2026-02-04T20:45:36+08:00'
author = "tdx"
draft = false
title = '提取指定区间bam文件'
categories = ["bam文件操作"]
tags = ["bed文件","bam文件"]
description = ""
+++
# 提取bed文件

```bash
cat /home2/pubdata/ref_data/TBlch_lgst.gff3 | awk -F "\t" '{if ($3=="gene") print $1 '\t' $4-5001 '\t' $5+5000}' > LITCHI001829.bed
```



# sambamba/samtolols

```bash
sambamba slice -L target.bed deduped.bam  > sambamba_view_L_target.bam

samtools view -hb -L target.bed deduped.bam  > samtools_view_L_target.bam

```