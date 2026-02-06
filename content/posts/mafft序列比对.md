+++
date = '2026-02-04T20:33:57+08:00'
author = "tdx"
draft = false
title = 'Mafft序列比对'
categories = ["本地使用生信工具"]
tags = ["mafft"]
description = "本地使用生信工具"
+++

## linux环境下安装MAFFT

```bash
mamba activate snp
mamba install -c bioconda mafft
```

### fa文件改名

==#示例文件名LITCHI013387_fzsl1.cds.fa==

```bash
# 根据fa文件名删除原表头替换目标表头
token="all."
for file in *.fa; do
  # 提取文件名和标题
  filename="${file%.*}" 
  title=">${filename##*$token}"
  # 打印调试信息
  echo "Processing file: $file"
  echo "Title: $title"
  # 删除原标题
  sed -i '1d' "$file"
  # 使用AWK方式插入新标题
  awk -v new_title="$title" 'BEGIN{FS=OFS="\n"} NR==1{print new_title} {print}' "$file" > temp && mv temp "$file"
done
```

### 合并fa文件

```bash
#防止序列拼接在上一条序列尾部
for i in $(ls *.fa);
do
  cat ${i}
   echo
done > LITCHI013387.total_sample.cds.fasta
```

### fasta文件比对

```bash
mafft --auto --quiet LITCHI013387.total_sample.cds.fasta > LITCHI0013387.allsample.cds.aligment.fasta
# 或者输出格式为clustal 
mafft --auto --thread 4 --clustalout MADS84.total_sample.cds.fasta > MADS84.allsample.cds.aligment.clustal
```

### 将比对结果美化

==Esprint3.0==

~/workpace/5_flower.gene_fasta  5个基因cds所有样品合并序列

~/workpace/5_flower.gene_fasta/merge_work/LITCHI013387_snp.indel.cds/013387.cds.sample


## 翻译核苷酸序列

```bash
transeq -sequence MADS46.total_sample.cds.fasta -outseq MADS46.total_sample.cds.translated.fasta
```

### 比对氨基酸序列(最大相似度考虑)

```bash
mafft --auto --reorder --thread 4 --quiet --clustalout LITCHI013387.total_sample.cds.fasta.protein.fasta > LITCHI013387.total_sample.cds.protein.clustal
```

比对结果聚类,构建系统发育树 
或者使用tbtools

