#!/usr/bin/env perl
# Git filter-branch msg-filter: 根据提交哈希选择正确的 commit message
# GIT_COMMIT 环境变量提供当前 commit 的哈希
use strict;
use warnings;

my $commit = $ENV{GIT_COMMIT};

# 读取新消息文件并输出
if ($commit eq '7ab7131ba68071513593a4f83b8eeca02e3b0064') {
    open(my $fh, '<:raw', 'scripts/msg-2.txt') or die "Cannot open msg-2.txt: $!";
    print while <$fh>;
    close $fh;
} elsif ($commit eq '3a4b532d312242f3ed002736c44641aba05175ce') {
    open(my $fh, '<:raw', 'scripts/msg-1.txt') or die "Cannot open msg-1.txt: $!";
    print while <$fh>;
    close $fh;
} else {
    # 其他提交原样输出
    while (<STDIN>) { print; }
}