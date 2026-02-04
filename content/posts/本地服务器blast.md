+++
date = '2026-02-04T20:26:34+08:00'
author = "你的名字"
draft = false
title = '本地服务器Blast'
categories = ["本地使用生信工具"]
tags = ["Blast","本地"]
description = ""
+++
# 建库

```bash
makeblastdb -in db.fasta -dbtype prot -out dbname
```

```text
主要参数说明：
-in：待格式化的序列文件（即db.fasta文件）
-dbtype：数据库类型，prot（蛋白质序列）或nucl（核酸序列）
-out：数据库名
更多参数说明请执行：makeblastdb -help
```

# 比对

```bash
blastp -query seq.fasta -out seq.blast -db dbname -outfmt 6 -evalue 1e-5 -num_threads 20 -max_target_seqs 10

主要参数说明:
-query：输入文件路径及文件名
-out：输出文件路径及文件名
-db：上一步建库的路径及数据库名
-outfmt：输出文件格式，总共有12种格式，6是tabular格式对应之前BLASTm8格式
-evalue：设置输出结果的e-value值
-max_target_seqs：最大对齐序列数
-num_alignments：显示对齐数据库序列的数目
-num_threads：线程数
更多参数说明 blastp –help
```

```bash
主要参数说明；
blastp:使用的比对程序（此处为蛋白质序列和蛋白质序列的比对）
-query:表示自己想要比对的FASTA格式的蛋白质序列（测序所得或从NCBI下载，此处为TP53B.fasta）
-db:是3.1中所建立的比对数据库，需要注意这个数据库的路径一定要正确，这里面的swissprot表示的是建库产生的.pdb、.phr、.pin等文件的共有前缀名称
-evalue：期望阈值，一般选择0.001
-out：输出文件路径及文件名(此处为TP53B.out)
