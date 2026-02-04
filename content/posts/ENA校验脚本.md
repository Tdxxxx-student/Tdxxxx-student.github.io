+++
date = '2026-02-04T12:58:06+08:00'
draft = false
title = 'ENA校验脚本'
tags = ["ENA"，"md5校验"]
categories = ["ENA数据库"]
+++

ENA下载的md5校验文件（tsv）格式转化和一键校验脚本
以下为脚本
```
#!/bin/bash
#===============================================================================
# 脚本名称: ena_md5_check.sh
# 功能描述: 自动转换ENA TSV文件并校验FASTQ文件完整性
# 作者: Claude Assistant
# 版本: 1.3
#===============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 显示帮助信息
show_help() {
    cat << EOF
================================================================================
ENA FASTQ MD5 校验工具 v1.3
================================================================================

用法: $0 <tsv文件> [fastq目录] [选项]

参数:
    <tsv文件>       ENA下载的filereport TSV文件 (必需)
    [fastq目录]     FASTQ文件所在目录 (默认: 当前目录)

选项:
    -s, --suffix    文件后缀 (默认: .fastq.gz)
    -o, --output    输出的MD5文件名 (默认: md5sums.txt)
    -r, --report    问题报告文件名 (默认: md5_failed_report.tsv)
    -h, --help      显示此帮助信息

支持:
    - 双端测序 (paired-end): SRR*_1.fastq.gz, SRR*_2.fastq.gz
    - 单端测序 (single-end): SRR*.fastq.gz

输出文件:
    md5sums.txt             生成的MD5校验文件
    md5_failed_report.tsv   仅当有问题时生成 (TSV格式)

示例:
    $0 filereport_read_run_PRJNA175477.tsv
    $0 filereport_read_run_PRJNA175477.tsv ./rawdata -s .fq.gz

================================================================================
EOF
    exit 0
}

# 默认参数
TSV_FILE=""
FASTQ_DIR="."
SUFFIX=".fastq.gz"
OUTPUT="md5sums.txt"
REPORT="md5_failed_report.tsv"

# 参数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--suffix) SUFFIX="$2"; shift 2 ;;
        -o|--output) OUTPUT="$2"; shift 2 ;;
        -r|--report) REPORT="$2"; shift 2 ;;
        -h|--help) show_help ;;
        -*) error "未知选项: $1" ;;
        *)
            if [[ -z "$TSV_FILE" ]]; then
                TSV_FILE="$1"
            else
                FASTQ_DIR="$1"
            fi
            shift
            ;;
    esac
done

# 参数检查
[[ -z "$TSV_FILE" ]] && error "请指定TSV文件，使用 -h 查看帮助"
[[ ! -f "$TSV_FILE" ]] && error "TSV文件不存在: $TSV_FILE"
[[ ! -d "$FASTQ_DIR" ]] && error "FASTQ目录不存在: $FASTQ_DIR"

FASTQ_DIR=$(cd "$FASTQ_DIR" && pwd)

info "=========================================="
info "ENA FASTQ MD5 校验工具 v1.3"
info "=========================================="
info "TSV文件:   $TSV_FILE"
info "FASTQ目录: $FASTQ_DIR"
info "文件后缀:  $SUFFIX"
info "=========================================="

#===============================================================================
# 步骤1: 转换TSV为MD5格式（支持单端和双端）
#===============================================================================
info "正在转换TSV文件..."

awk -F'\t' -v suffix="$SUFFIX" -v dir="$FASTQ_DIR" '
{
    gsub(/\r/, "")
    if ($1 ~ /^[SE]RR[0-9]+$/ && $2 != "") {
        srr = $1
        md5_str = $2
        n = split(md5_str, md5s, ";")
        
        if (n == 2) {
            # 双端测序
            printf "%s  %s/%s_1%s\n", md5s[1], dir, srr, suffix
            printf "%s  %s/%s_2%s\n", md5s[2], dir, srr, suffix
        } else if (n == 1 && md5s[1] != "") {
            # 单端测序
            printf "%s  %s/%s%s\n", md5s[1], dir, srr, suffix
        }
    }
}' "$TSV_FILE" > "$OUTPUT"

count=$(wc -l < "$OUTPUT")
[[ $count -eq 0 ]] && error "未能提取任何MD5记录，请检查TSV文件格式"

success "生成MD5文件: $OUTPUT ($count 条记录)"
info "预览前5行:"
head -5 "$OUTPUT" | sed 's/^/    /'

#===============================================================================
# 步骤2: 校验文件完整性
#===============================================================================
echo ""
info "开始校验文件完整性..."
info "(大文件需要较长时间，请耐心等待)"
echo ""

total=$count
current=0
passed=0
failed=0
missing=0

# 临时存储问题文件（TSV格式：文件名\t原因）
FAILED_TMP=$(mktemp)

while read -r line; do
    current=$((current + 1))
    
    expected_md5=$(echo "$line" | awk '{print $1}')
    filepath=$(echo "$line" | sed 's/^[^ ]*  //')
    filename=$(basename "$filepath")
    
    printf "[%d/%d] %s ... " "$current" "$total" "$filename"
    
    # 检查文件是否存在
    if [[ ! -f "$filepath" ]]; then
        echo -e "${YELLOW}缺失${NC}"
        missing=$((missing + 1))
        printf "%s\t%s\n" "$filename" "文件不存在" >> "$FAILED_TMP"
        continue
    fi
    
    # 计算MD5
    actual_md5=$(md5sum "$filepath" | awk '{print $1}')
    
    if [[ "$expected_md5" == "$actual_md5" ]]; then
        echo -e "${GREEN}OK${NC}"
        passed=$((passed + 1))
    else
        echo -e "${RED}FAILED${NC}"
        failed=$((failed + 1))
        printf "%s\t%s\n" "$filename" "MD5不匹配(期望:${expected_md5},实际:${actual_md5})" >> "$FAILED_TMP"
    fi
    
done < "$OUTPUT"

#===============================================================================
# 步骤3: 输出统计结果
#===============================================================================
echo ""
info "=========================================="
info "校验完成！统计结果:"
info "=========================================="
echo "  总计: $total"
echo -e "  ${GREEN}通过: $passed${NC}"
echo -e "  ${RED}失败: $failed${NC}"
echo -e "  ${YELLOW}缺失: $missing${NC}"
info "=========================================="

#===============================================================================
# 步骤4: 仅当有问题时生成报告（TSV格式）
#===============================================================================
if [[ $failed -gt 0 || $missing -gt 0 ]]; then
    # 生成TSV报告：表头 + 内容
    echo -e "filename\treason" > "$REPORT"
    cat "$FAILED_TMP" >> "$REPORT"
    
    echo ""
    warn "问题文件列表:"
    echo -e "${YELLOW}filename\treason${NC}"
    cat "$FAILED_TMP"
    echo ""
    warn "✗ 存在问题文件！"
    success "问题报告已保存至: $REPORT"
else
    rm -f "$REPORT"
    echo ""
    success "✓ 所有文件校验通过！无问题报告生成。"
fi

# 清理
rm -f "$FAILED_TMP"

[[ $failed -gt 0 || $missing -gt 0 ]] && exit 1 || exit 0
```

## 更新说明

### 1. 支持单端测序

|测序类型|MD5格式|生成文件|
|---|---|---|
|双端|`md5_1;md5_2`|`SRR*_1.fastq.gz`, `SRR*_2.fastq.gz`|
|单端|`md5`|`SRR*.fastq.gz`|

### 2. 错误报告格式（TSV）


```
filename	reason
SRR576084_1.fastq.gz	MD5不匹配(期望:ee9c08fd...,实际:a1b2c3d4...)
SRR576089_1.fastq.gz	文件不存在
```

## 使用方法


```
chmod +x ena_md5_check.sh

# 基本用法
./ena_md5_check.sh filereport_read_run_PRJNA175477.tsv .

# 指定目录和后缀
./ena_md5_check.sh filereport.tsv ./rawdata -s .fq.gz

# 查看错误报告
cat md5_failed_report.tsv

# 用Excel或其他工具打开TSV报告
```

## 输出示例

### 终端输出


```
[INFO] ==========================================
[INFO] ENA FASTQ MD5 校验工具 v1.3
[INFO] ==========================================
[1/10] SRR064552_1.fastq.gz ... OK
[2/10] SRR064552_2.fastq.gz ... OK
[3/10] SRR064553.fastq.gz ... OK        # 单端测序
[4/10] SRR064554_1.fastq.gz ... FAILED
[5/10] SRR064554_2.fastq.gz ... 缺失
...
[INFO] ==========================================
[INFO] 校验完成！统计结果:
[INFO] ==========================================
  总计: 10
  通过: 8
  失败: 1
  缺失: 1
[INFO] ==========================================

[WARNING] 问题文件列表:
filename	reason
SRR064554_1.fastq.gz	MD5不匹配(期望:ee9c08fd...,实际:a1b2c3d4...)
SRR064554_2.fastq.gz	文件不存在

[SUCCESS] 问题报告已保存至: md5_failed_report.tsv
```

### 错误报告文件 (md5_failed_report.tsv)

| filename             | reason                                |
| -------------------- | ------------------------------------- |
| SRR064554_1.fastq.gz | MD5不匹配(期望:ee9c08fd...,实际:a1b2c3d4...) |
| SRR064554_2.fastq.gz | 文件不存在                                 |