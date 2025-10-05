// 等待页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 1. 初始化地图（显示在id为geojson-map的容器里）
  const map = L.map('geojson-map').setView([50.325, 6.925], 14); // 纽伯格林赛道的大致坐标

  // 2. 添加底图（可选，类似地图背景）
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© 开放街道图贡献者'
  }).addTo(map);

  // 3. 加载GeoJSON数据（你需要准备一个赛道的GeoJSON文件）
  // 假设你的GeoJSON文件叫nurburgring.geojson，放在项目根目录
  fetch('441900.geojson')
    .then(response => response.json()) // 解析JSON数据
    .then(geojsonData => {
      // 4. 定义地图上赛道的默认样式
      const defaultStyle = {
        color: '#e60000', // 赛道颜色（用你CSS里的主色）
        weight: 5, // 线条粗细
        opacity: 0.8 // 透明度
      };

      // 5. 定义鼠标悬停时的样式（高亮效果）
      const highlightStyle = {
        color: '#ff6b00', // 悬停时的颜色
        weight: 8, // 更粗的线条
        opacity: 1 // 不透明
      };

      // 6. 创建GeoJSON图层并添加到地图
      const trackLayer = L.geoJSON(geojsonData, {
        style: defaultStyle, // 使用默认样式
        onEachFeature: function(feature, layer) {
          // 7. 给赛道添加鼠标悬停事件
          layer.on('mouseover', function() {
            layer.setStyle(highlightStyle); // 鼠标放上去时变样式
            // 如果GeoJSON里有赛道名称，显示弹窗
            if (feature.properties.name) {
              layer.bindPopup(`<strong>${feature.properties.name}</strong>`).openPopup();
            }
          });

          // 8. 鼠标离开时恢复默认样式
          layer.on('mouseout', function() {
            layer.setStyle(defaultStyle);
            map.closePopup(); // 关闭弹窗
          });
        }
      }).addTo(map);

      // 9. 自动调整地图视野，让整个赛道显示在屏幕中
      map.fitBounds(trackLayer.getBounds());
    })
    .catch(error => {
      console.error('加载GeoJSON失败：', error);
      alert('地图数据加载失败，请检查文件是否存在');
    });
});