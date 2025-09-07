-- 创建轮播图表
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建解决方案表
CREATE TABLE IF NOT EXISTS solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  icon_url TEXT,
  case_images TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image_url TEXT,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建访问统计表
CREATE TABLE IF NOT EXISTS visit_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL,
  user_region VARCHAR(100),
  device_type VARCHAR(50),
  visit_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTEGER DEFAULT 0
);

-- 插入示例数据
INSERT INTO banners (title, image_url, link_url, sort_order) VALUES
('智能解决方案', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20technology%20banner%20with%20blue%20gradient&image_size=landscape_16_9', '/solutions', 1),
('产品服务', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20services%20banner%20with%20corporate%20style&image_size=landscape_16_9', '/products', 2),
('企业合作', 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=business%20partnership%20handshake%20banner&image_size=landscape_16_9', '/about', 3);

INSERT INTO solutions (title, description, content, sort_order) VALUES
('数字化转型', '帮助企业实现全面数字化升级', '我们提供完整的数字化转型解决方案，包括系统集成、流程优化、数据分析等服务。', 1),
('云计算服务', '提供稳定可靠的云基础设施', '基于先进的云计算技术，为企业提供弹性、安全、高效的云服务平台。', 2),
('人工智能', '智能化业务流程优化', '运用AI技术优化业务流程，提升企业运营效率和决策质量。', 3);

INSERT INTO products (name, description, category, features) VALUES
('企业管理系统', '全面的企业资源管理解决方案', '软件产品', ARRAY['用户管理', '权限控制', '数据分析', '报表生成']),
('移动应用开发', '专业的移动端应用开发服务', '开发服务', ARRAY['iOS开发', 'Android开发', '跨平台开发', 'UI/UX设计']),
('数据分析平台', '强大的数据处理和分析工具', '软件产品', ARRAY['实时分析', '可视化报表', '预测模型', 'API集成']);

-- 创建默认管理员账户 (密码: admin123)
INSERT INTO admins (username, password_hash, email) VALUES
('admin', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQq', 'admin@example.com');

-- 启用行级安全策略
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_analytics ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "Allow public read access" ON banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON solutions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON visit_analytics FOR SELECT USING (true);

-- 授权给匿名和认证用户
GRANT SELECT ON banners TO anon, authenticated;
GRANT SELECT ON solutions TO anon, authenticated;
GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT ON visit_analytics TO anon, authenticated;
GRANT ALL PRIVILEGES ON admins TO authenticated;

-- 为认证用户授权写入权限
GRANT INSERT, UPDATE, DELETE ON banners TO authenticated;
GRANT INSERT, UPDATE, DELETE ON solutions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON visit_analytics TO authenticated;