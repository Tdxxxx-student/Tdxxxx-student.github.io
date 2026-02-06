+++
date = '2026-02-04T20:19:11+08:00'
author = "tdx"
draft = false
title = 'Annovar基因结构注释'
categories = ["基因结构注释"]
tags = ["R基因结构","annovar"]
description = ""
+++

## 下载软件
准备文件：物种gff和fasta文件

<https://www.openbioinformatics.org/annovar/annovar_download_form.php>
填写教育类邮箱获取下载链接；

下载、解压、添加环境变量

```bash
sudo vi /etc/profile.d/env.sh
# 追加
# export PATH=/pub/software/annovar:$PATH
source  /etc/profile.d/env.sh
```

## gff3ToGenePred安装

UCSC软件库查找

<http://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/>

```bash
# 下载
cd /pub/software/annovar
wget http://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/gff3ToGenePred
# 执行权限
chmod +x ./gff3ToGenePred
```

## 构建注释数据库

```bash
# 文件准备
cp /fasta路径/
cp /gff3路径/
# gff文件加头
echo "##gff-version 3" | cat - lch.gff3 > temp && mv temp lch.gff3

gff3ToGenePred gff文件 lchgenome_refGene.txt

retrieve_seq_from_fasta.pl --format refGene \
    --seqfile Lchinesis_genome.Chr.fasta \
    --out lchgenome_refGeneMrna.fa \
    lchgenome_refGene.txt
```

```bash
mv Lchinesis_genome.Chr.gff3 lch.gff3
```


```bash
gff3ToGenePred lch.gff3 lchgenome_refGene.txt
retrieve_seq_from_fasta.pl --format refGene \
    --seqfile Lchinesis_genome.Chr.fasta \
    --out lchgenome_refGeneMrna.fa \
    lchgenome_refGene.txt
```

**genome_refGene.txt 和 genome_refGeneMrna.fa**两个文件的前缀都为**genome**，这里的命名很重要

```bash
convert2annovar.pl -format vcf4old /home2/xtc/workspace/circlize/circle/fdp.FZX.test_filtered.vcf  > lch_fzx.avinput

annotate_variation.pl --neargene 2000 -out lch_fzx -build lchgenome lch_fzx.avinput /home2/xtc/workspace/annovar/lcg.data
```