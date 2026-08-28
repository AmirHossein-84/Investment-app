import os
import base64

fonts_dir = "store-assets/fonts"
raw_dir = "store-assets/raw-screens"
out_dir = "store-assets/html"
os.makedirs(out_dir, exist_ok=True)

def get_base64_file(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

font_bold_b64 = get_base64_file(os.path.join(fonts_dir, "Vazirmatn-Bold.ttf"))
font_black_b64 = get_base64_file(os.path.join(fonts_dir, "Vazirmatn-Black.ttf"))
font_med_b64 = get_base64_file(os.path.join(fonts_dir, "Vazirmatn-Medium.ttf"))

banners_data = [
    {
        "id": "banner_1",
        "badge_icon": "🪙 + ⚡",
        "badge_text": "سبد سرمایه‌گذاری متوازن",
        "badge_border": "rgba(245, 158, 11, 0.4)",
        "badge_bg": "rgba(245, 158, 11, 0.1)",
        "badge_color": "#FCD34D",
        "title": "محاسبه هوشمند و بازتعادل <span class='gold-text'>سبد سرمایه</span>",
        "subtitle": "تخصیص دقیق مبالغ پس‌انداز برای خرید طلا و ارز دیجیتال بر مبنای فرمول طلایی ۸۰ / ۲۰",
        "screen_file": "01_dashboard.png",
        "glow_1": "radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.22) 0%, transparent 60%)",
        "glow_2": "radial-gradient(circle at 50% 80%, rgba(99, 102, 241, 0.18) 0%, transparent 60%)",
    },
    {
        "id": "banner_2",
        "badge_icon": "🪙",
        "badge_text": "بازار طلای بورس و فیزیکی",
        "badge_border": "rgba(245, 158, 11, 0.4)",
        "badge_bg": "rgba(245, 158, 11, 0.1)",
        "badge_color": "#FCD34D",
        "title": "نرخ لحظه‌ای <span class='gold-text'>صندوق‌های ETF طلا</span> و سکه امامی",
        "subtitle": "اتصال آنلاین به تابلوی بورس TSETMC و شبکه اطلاع‌رسانی طلا (TGJU) بدون تاخیر",
        "screen_file": "02_gold_market.png",
        "glow_1": "radial-gradient(circle at 50% 25%, rgba(245, 158, 11, 0.28) 0%, transparent 65%)",
        "glow_2": "radial-gradient(circle at 50% 85%, rgba(217, 119, 6, 0.2) 0%, transparent 60%)",
    },
    {
        "id": "banner_3",
        "badge_icon": "⚡",
        "badge_text": "اتصال خودکار به صرافی نوبیتکس",
        "badge_border": "rgba(99, 102, 241, 0.4)",
        "badge_bg": "rgba(99, 102, 241, 0.12)",
        "badge_color": "#A5B4FC",
        "title": "دریافت موجودی و <span class='indigo-text'>محاسبه سود/زیان</span> رمزارزها",
        "subtitle": "همگام‌سازی آنی کیف‌پول‌ها، قیمت‌های زنده و مانده ریالی با کلید API اختصاصی",
        "screen_file": "03_crypto_market.png",
        "glow_1": "radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.26) 0%, transparent 60%)",
        "glow_2": "radial-gradient(circle at 50% 80%, rgba(20, 241, 149, 0.16) 0%, transparent 60%)",
    },
    {
        "id": "banner_4",
        "badge_icon": "📊",
        "badge_text": "نمودار سهم دارایی‌ها و طلای فیزیکی",
        "badge_border": "rgba(251, 191, 36, 0.4)",
        "badge_bg": "rgba(251, 191, 36, 0.12)",
        "badge_color": "#FDE047",
        "title": "مدیریت <span class='gold-text'>مسکوکات، شمش</span> و طلای ۱۸ و ۲۴ عیار",
        "subtitle": "ثبت دقیق موجودی فیزیکی و بورسی با امکان تبدیل آنی به دلار ($) بر مبنای نرخ تتر",
        "screen_file": "04_holdings.png",
        "glow_1": "radial-gradient(circle at 50% 22%, rgba(251, 191, 36, 0.25) 0%, transparent 60%)",
        "glow_2": "radial-gradient(circle at 50% 85%, rgba(99, 102, 241, 0.18) 0%, transparent 60%)",
    },
    {
        "id": "banner_5",
        "badge_icon": "💰",
        "badge_text": "خروج امن و نقد کردن سرمایه",
        "badge_border": "rgba(16, 185, 129, 0.4)",
        "badge_bg": "rgba(16, 185, 129, 0.12)",
        "badge_color": "#6EE7B7",
        "title": "فروش هوشمند <span class='emerald-text'>بدون کسر طلای فیزیکی</span>",
        "subtitle": "محاسبه تعداد دقیق واحدهای بورس و کریپتو برای نقد کردن و حفظ تعادل سرمایه",
        "screen_file": "05_sell_rebalance.png",
        "glow_1": "radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.22) 0%, transparent 60%)",
        "glow_2": "radial-gradient(circle at 50% 85%, rgba(225, 29, 72, 0.16) 0%, transparent 60%)",
    }
]

html_template = """<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @font-face {{
    font-family: 'Vazirmatn';
    src: url(data:font/truetype;charset=utf-8;base64,{font_bold_b64}) format('truetype');
    font-weight: 700;
  }}
  @font-face {{
    font-family: 'Vazirmatn';
    src: url(data:font/truetype;charset=utf-8;base64,{font_black_b64}) format('truetype');
    font-weight: 900;
  }}
  @font-face {{
    font-family: 'Vazirmatn';
    src: url(data:font/truetype;charset=utf-8;base64,{font_med_b64}) format('truetype');
    font-weight: 500;
  }}

  * {{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }}

  body {{
    width: 1080px;
    height: 2280px;
    overflow: hidden;
    background: #080B10;
    font-family: 'Vazirmatn', sans-serif;
    color: #F8FAFC;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }}

  /* Ambient Glow Layers */
  .glow-1 {{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1200px;
    background: {glow_1};
    pointer-events: none;
  }}
  .glow-2 {{
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1200px;
    background: {glow_2};
    pointer-events: none;
  }}

  /* Top Decorative Geometric Grid */
  .grid-pattern {{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 900px;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
    pointer-events: none;
  }}

  /* Header Section */
  .header-content {{
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 130px 60px 50px 60px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }}

  .badge {{
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 12px 28px;
    background: {badge_bg};
    border: 2px solid {badge_border};
    border-radius: 9999px;
    font-size: 26px;
    font-weight: 700;
    color: {badge_color};
    margin-bottom: 36px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    backdrop-filter: blur(16px);
  }}

  .title {{
    font-size: 52px;
    font-weight: 900;
    line-height: 1.35;
    letter-spacing: -0.5px;
    color: #FFFFFF;
    margin-bottom: 22px;
    max-width: 960px;
  }}

  .gold-text {{
    background: linear-gradient(135deg, #FFF085 0%, #F59E0B 50%, #D97706 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}

  .indigo-text {{
    background: linear-gradient(135deg, #C7D2FE 0%, #818CF8 50%, #6366F1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}

  .emerald-text {{
    background: linear-gradient(135deg, #A7F3D0 0%, #34D399 50%, #10B981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}

  .subtitle {{
    font-size: 26px;
    font-weight: 500;
    line-height: 1.6;
    color: #94A3B8;
    max-width: 900px;
  }}

  /* Phone Mockup Frame */
  .mockup-container {{
    position: relative;
    z-index: 10;
    width: 880px;
    flex: 1;
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }}

  .phone-body {{
    width: 880px;
    height: 1950px;
    background: #11141B;
    border-radius: 96px 96px 0 0;
    padding: 24px 24px 0 24px;
    border-top: 5px solid rgba(255, 255, 255, 0.18);
    border-left: 5px solid rgba(255, 255, 255, 0.12);
    border-right: 5px solid rgba(255, 255, 255, 0.12);
    box-shadow: 
      0 -20px 80px rgba(0, 0, 0, 0.9),
      0 0 100px rgba(245, 158, 11, 0.08);
    position: relative;
    overflow: hidden;
  }}

  /* Dynamic Island / Speaker notch */
  .notch {{
    position: absolute;
    top: 42px;
    left: 50%;
    transform: translateX(-50%);
    width: 170px;
    height: 40px;
    background: #06080B;
    border-radius: 20px;
    z-index: 30;
  }}

  /* Phone Screen Image */
  .phone-screen {{
    width: 100%;
    height: 100%;
    border-radius: 76px 76px 0 0;
    overflow: hidden;
    background: #0B0F17;
  }}

  .phone-screen img {{
    width: 100%;
    height: auto;
    display: block;
  }}
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="grid-pattern"></div>

  <div class="header-content">
    <div class="badge">
      <span>{badge_icon}</span>
      <span>{badge_text}</span>
    </div>
    <h1 class="title">{title}</h1>
    <p class="subtitle">{subtitle}</p>
  </div>

  <div class="mockup-container">
    <div class="phone-body">
      <div class="notch"></div>
      <div class="phone-screen">
        <img src="data:image/png;base64,{screen_b64}" alt="Screen Preview">
      </div>
    </div>
  </div>
</body>
</html>
"""

for b in banners_data:
    screen_path = os.path.join(raw_dir, b["screen_file"])
    screen_b64 = get_base64_file(screen_path)
    
    html = html_template.format(
        font_bold_b64=font_bold_b64,
        font_black_b64=font_black_b64,
        font_med_b64=font_med_b64,
        glow_1=b["glow_1"],
        glow_2=b["glow_2"],
        badge_icon=b["badge_icon"],
        badge_text=b["badge_text"],
        badge_bg=b["badge_bg"],
        badge_border=b["badge_border"],
        badge_color=b["badge_color"],
        title=b["title"],
        subtitle=b["subtitle"],
        screen_b64=screen_b64
    )
    
    out_file = os.path.join(out_dir, f"{b['id']}.html")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Generated {out_file}")

print("All 5 banner HTML files generated successfully!")
