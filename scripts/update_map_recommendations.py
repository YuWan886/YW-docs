#!/usr/bin/env python3
"""
自动更新地图推荐脚本
从 docs/src/posts/map/done/ 文件夹中随机选择5个地图，更新 pcl_sub_file.xaml 文件
"""

import os
import random
import re
import yaml
from pathlib import Path
from datetime import datetime

def parse_markdown_frontmatter(file_path):
    """解析Markdown文件的frontmatter"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取frontmatter
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return None
    
    frontmatter_content = frontmatter_match.group(1)
    try:
        data = yaml.safe_load(frontmatter_content)
        return data
    except yaml.YAMLError:
        return None

def extract_links_from_markdown(file_path):
    """从Markdown文件中提取链接信息"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    links = {
        'original_url': '',
        'download_url': '',
        'detail_url': ''
    }
    
    # 提取原址链接
    original_match = re.search(r'- 原址：\[.*?\]\((.*?)\)', content)
    if original_match:
        links['original_url'] = original_match.group(1)
    
    # 提取下载链接
    download_match = re.search(r'- 汉化：\[.*?\]\((.*?)\)', content)
    if download_match:
        links['download_url'] = download_match.group(1)
    
    # 生成详情页链接（基于文件名）
    filename = Path(file_path).stem
    links['detail_url'] = f"https://docs.yw-games.top/posts/map/done/{filename}.html"
    
    return links

def extract_description_from_markdown(file_path):
    """从Markdown文件中提取描述内容"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 移除frontmatter
    content = re.sub(r'^---\n.*?\n---', '', content, flags=re.DOTALL)
    
    # 提取介绍部分（## 介绍 之后的内容）
    intro_match = re.search(r'##\s*介绍\s*\n(.*?)(?=\n##|\n<|$)', content, re.DOTALL)
    if intro_match:
        description = intro_match.group(1).strip()
        # 清理描述文本
        description = re.sub(r'!\[.*?\]\(.*?\)', '', description)  # 移除图片
        description = re.sub(r'<.*?>', '', description)  # 移除HTML标签
        description = re.sub(r'\n+', ' ', description)  # 合并换行
        description = re.sub(r'\s+', ' ', description)  # 合并空格
        return description[:200] + "..." if len(description) > 200 else description
    
    return ""

def get_all_maps(done_folder):
    """获取所有地图文件的信息"""
    maps = []
    done_path = Path(done_folder)
    
    for md_file in done_path.glob("*.md"):
        if md_file.name == "index.md":
            continue
            
        frontmatter = parse_markdown_frontmatter(md_file)
        if not frontmatter:
            continue
            
        description = extract_description_from_markdown(md_file)
        links = extract_links_from_markdown(md_file)
        
        map_info = {
            'filename': md_file.stem,
            'title': frontmatter.get('title', ''),
            'cover': frontmatter.get('cover', ''),
            'tags': frontmatter.get('tags', []),
            'description': description,
            'created': frontmatter.get('created', ''),
            'updated': frontmatter.get('updated', ''),
            'links': links
        }
        
        # 确保有标题和封面图
        if map_info['title'] and map_info['cover']:
            maps.append(map_info)
    
    return maps

def generate_xaml_card(map_info, index):
    """生成单个地图的XAML卡片 - 美化版本"""
    image_url = map_info['cover']
    links = map_info['links']
    
    card_template = f'''
<local:MyCard Title="" Margin="0,0,0,16" CanSwap="False" IsSwaped="false">
    <Border Background="#ffffff"  BorderThickness="1" BorderBrush="#e5e7eb">
        <Border.Effect>
            <DropShadowEffect BlurRadius="10" ShadowDepth="2" Opacity="0.1" Direction="270"/>
        </Border.Effect>
        <Grid Margin="12">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="Auto"/>
                <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>
            
            <!-- 左侧图片区域 -->
            <Border Grid.Column="0" Width="120" Height="68"  >
                <Image Source="{image_url}" Stretch="UniformToFill" VerticalAlignment="Center" HorizontalAlignment="Center"/>
            </Border>
            
            <!-- 右侧内容区域 -->
            <StackPanel Grid.Column="1" Margin="12,0,0,0">
                <!-- 标题 -->
                <TextBlock Text="{map_info['title']}"  FontWeight="SemiBold" FontFamily="微软雅黑"
                           Foreground="#111827" TextWrapping="Wrap" MaxHeight="40" Margin="0,0,0,8"/>
                
                <!-- 描述 -->
                <TextBlock Text="{map_info['description']}"  FontFamily="微软雅黑"
                           Foreground="#6b7280" TextWrapping="Wrap" MaxHeight="36" TextTrimming="CharacterEllipsis"/>
                
                <!-- 按钮区域 -->
                <StackPanel Orientation="Horizontal" Margin="0,12,0,0">
                    <local:MyTextButton Text="查看详情"  FontWeight="Medium" Padding="10,4" Margin="0,0,8,0"
                        EventType="打开网页" EventData="{links['detail_url']}"
                        Background="#e5e7eb" Foreground="#374151" 
                        BorderThickness="0"/>
                    <local:MyTextButton Text="查看原址"  FontWeight="Medium" Padding="10,4" Margin="0,0,8,0"
                        EventType="打开网页" EventData="{links['original_url']}"
                        Background="#fee2e2" Foreground="#b91c1c" 
                        BorderThickness="0"/>
                    <local:MyTextButton Text="点击下载"  FontWeight="Medium" Padding="10,4"
                        EventType="打开网页" EventData="{links['download_url']}"
                        Background="#d1fae5" Foreground="#065f46" 
                        BorderThickness="0"/>
                </StackPanel>
            </StackPanel>
        </Grid>
    </Border>
</local:MyCard>
'''
    return card_template

def generate_complete_xaml(maps):
    """生成完整的XAML文件内容 - 美化版本"""
    header = '''<local:MyCard Title="" Margin="0,0,0,16" CanSwap="False" IsSwaped="false">
    <Border >
        <Border.Background>
            <LinearGradientBrush StartPoint="0,0" EndPoint="1,1">
                <GradientStop Color="#6b7280" Offset="0.0"/>
                <GradientStop Color="#3b82f6" Offset="1.0"/>
            </LinearGradientBrush>
        </Border.Background>
        <Grid Margin="20">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="Auto"/>
            </Grid.ColumnDefinitions>
            
            <!-- 左侧文本内容 -->
            <StackPanel Grid.Column="0">
                <TextBlock Text="每日地图推荐"  FontWeight="Bold" FontFamily="微软雅黑"
                           Foreground="#ffffff" Margin="0,0,0,8">
                    <TextBlock.Effect>
                        <DropShadowEffect BlurRadius="8" ShadowDepth="1" Opacity="0.2" Color="#000000"/>
                    </TextBlock.Effect>
                </TextBlock>
                <TextBlock Text="每日精选5张优质地图，为您带来不一样的游戏体验！"
                            FontFamily="微软雅黑" Foreground="#e5e7eb" Margin="0,0,0,12"/>
                <StackPanel Orientation="Horizontal">
                <local:MyButton Text="作者B站"  Padding="10,4" Margin="0,0,8,0" ColorType="Highlight"
                                    EventType="打开网页" EventData="https://space.bilibili.com/438381132"
                                    />
                <local:MyButton Text="文档主页"  Padding="10,4" Margin="0,0,8,0" ColorType="Highlight"
                                    EventType="打开网页" EventData="https://docs.yw-games.top/"
                                    />
                <local:MyButton Text="反馈问题"  Padding="10,4" Margin="0,0,8,0" ColorType="Highlight"
                                    EventType="打开网页" EventData="https://github.com/YuWan886/YW-docs/issues"
                                    />
                </StackPanel>
            </StackPanel>
            
            <!-- 右侧图片区域 -->
            <Border Grid.Column="1" Width="80" Height="80" Margin="20,0,0,0">
                <Image Source="https://docs.yw-games.top/img/logo.png" Stretch="Uniform"
                       VerticalAlignment="Center" HorizontalAlignment="Center"/>
            </Border>
        </Grid>
    </Border>
</local:MyCard>

'''
    
    # 生成地图卡片
    map_cards = []
    for i, map_info in enumerate(maps):
        map_cards.append(generate_xaml_card(map_info, i))
    
    return header + '\n'.join(map_cards)

def update_xaml_file(maps, xaml_file_path):
    """更新XAML文件"""
    new_content = generate_complete_xaml(maps)
    
    with open(xaml_file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"成功更新了 {len(maps)} 个地图推荐")

def main():
    """主函数"""
    base_dir = Path(__file__).parent.parent
    done_folder = base_dir / "docs" / "src" / "posts" / "map" / "done"
    xaml_file = base_dir / "docs" / "src" / "posts" / "map" / "pcl_sub_file.xaml"
    
    print(f"扫描文件夹: {done_folder}")
    print(f"目标文件: {xaml_file}")
    
    # 获取所有地图
    all_maps = get_all_maps(done_folder)
    print(f"找到 {len(all_maps)} 个有效地图")
    
    if len(all_maps) < 5:
        print("错误：地图数量不足5个")
        return
    
    # 随机选择5个地图
    selected_maps = random.sample(all_maps, 5)
    
    # 更新XAML文件
    update_xaml_file(selected_maps, xaml_file)
    
    print("地图推荐更新完成！")
    print("选中的地图：")
    for i, map_info in enumerate(selected_maps, 1):
        print(f"{i}. {map_info['title']}")

if __name__ == "__main__":
    main()