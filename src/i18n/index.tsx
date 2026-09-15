import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Language = 'zh' | 'en';

const translations = {
  zh: {
    // Nav
    nav_home: '首页',
    nav_configurator: '配置器',
    nav_compare: '对比',
    nav_review: '确认',
    nav_quote: '询价',

    // Home hero
    hero_badge: '电缸在线选型配置器',
    hero_title_line1: '用您的工况，',
    hero_title_line2: '定义运动系统。',
    hero_subtitle: '围绕您的应用配置电缸、传动、电机、驱动器与控制系统 —— 实时兼容性校验与工程验证。',
    hero_smart_cta: '智能选型',
    hero_build_cta: '自由配置',
    hero_visual_label: '实时产品可视化',

    // Process steps
    step1_title: '明确需求',
    step2_title: '配置系统',
    step3_title: '工程验证',
    step4_title: '构建方案',

    // Configurator
    cfg_requirements: '工况需求',
    cfg_platform: '电缸平台',
    cfg_transmission: '传动方式',
    cfg_screw_belt: '丝杠/同步带',
    cfg_motor: '电机',
    cfg_drive: '驱动器',
    cfg_encoder_sensors: '编码器与传感器',
    cfg_accessories: '安装附件',
    cfg_engineering: '工程校核',
    cfg_review: '方案确认',
    cfg_current: '当前配置',
    cfg_reset: '重置配置',
    cfg_copy_link: '复制链接',
    cfg_review_btn: '查看方案',
    cfg_quote_btn: '申请询价',
    cfg_download_bom: '下载 BOM',

    // Status
    status_recommended: '推荐',
    status_compatible: '兼容',
    status_warning: '警告',
    status_incompatible: '不兼容',
    status_why: '为何不可选？',

    // Engineering check
    eng_check: '工程校核',
    eng_valid: '配置有效',
    eng_attention: '需要注意',
    eng_invalid: '配置无效',
    eng_passed: '通过',
    eng_warn: '警告',
    eng_fail: '不通过',

    // Performance
    perf_rated_thrust: '额定推力',
    perf_peak_thrust: '峰值推力',
    perf_max_speed: '最大速度',
    perf_accel: '加速度',
    perf_stroke: '行程',
    perf_repeatability: '重复定位精度',
    perf_motor_rpm: '电机转速',
    perf_motor_torque: '电机扭矩',
    perf_safety: '安全系数',
    perf_life: '预估寿命',
    perf_payload: '负载',

    // Units
    unit_n: 'N',
    unit_mm_s: 'mm/s',
    unit_mm: 'mm',
    unit_rpm: 'rpm',
    unit_nm: 'N·m',
    unit_h: 'h',
    unit_g: 'g',

    // Visualizer views
    view_side: '立式视图',
    view_transmission: '传动结构',
    view_exploded: '分解视图',
    label_motor: '伺服电机',
    label_carriage: '滑台',
    label_rod: '推杆',
    label_rod_end: '鱼眼关节',
    label_body: '铝型材本体',
    label_screw: '滚珠丝杠',
    label_belt: '同步带',
    label_coupling: '联轴器',
    label_bearing: '关节轴承',

    // Review
    review_your_config: '您的配置',
    review_config_id: '配置编号',
    review_copy: '复制',
    review_download_json: '下载配置 JSON',
    review_download_bom: '下载 BOM CSV',
    review_cad_disabled: 'CAD 集成待接入产品数据服务',

    // Quote
    quote_title: '申请工程询价',
    quote_company: '公司名称',
    quote_name: '联系人',
    quote_email: '邮箱',
    quote_phone: '电话',
    quote_country: '国家/地区',
    quote_application: '应用描述',
    quote_quantity: '项目数量',
    quote_delivery: '期望交付日期',
    quote_message: '备注',
    quote_submit: '提交询价',
    quote_success: '询价请求已生成',
    quote_demo_note: '演示提交 —— 生产环境需接入后端服务。',
    quote_copy_json: '复制请求 JSON',

    // Common
    common_demo: '演示数据',
    common_demo_notice: '演示工程数据，最终值以实际产品规格为准。',
    common_not_configured: '未配置',
    common_loading: '加载中…',
    common_basic: '基础',
    common_advanced: '高级',
    common_why_unavailable: '为何不可选？',
  },
  en: {
    nav_home: 'Home',
    nav_configurator: 'Configurator',
    nav_compare: 'Compare',
    nav_review: 'Review',
    nav_quote: 'Quote',

    hero_badge: 'Electric Cylinder Configurator',
    hero_title_line1: 'Configure',
    hero_title_line2: 'Your Motion.',
    hero_subtitle: 'Configure the cylinder, transmission, motor, drive and control system around your application — with real-time compatibility and engineering validation.',
    hero_smart_cta: 'Smart Selection',
    hero_build_cta: 'Build Your Own',
    hero_visual_label: 'Live product visualization',

    step1_title: 'Define Requirements',
    step2_title: 'Configure System',
    step3_title: 'Validate Engineering',
    step4_title: 'Build Solution',

    cfg_requirements: 'Requirements',
    cfg_platform: 'Platform',
    cfg_transmission: 'Transmission',
    cfg_screw_belt: 'Screw / Belt',
    cfg_motor: 'Motor',
    cfg_drive: 'Drive',
    cfg_encoder_sensors: 'Encoder & Sensors',
    cfg_accessories: 'Accessories',
    cfg_engineering: 'Engineering Check',
    cfg_review: 'Review',
    cfg_current: 'Current Configuration',
    cfg_reset: 'Reset Configuration',
    cfg_copy_link: 'Copy Link',
    cfg_review_btn: 'Review Configuration',
    cfg_quote_btn: 'Request Engineering Quote',
    cfg_download_bom: 'Download BOM',

    status_recommended: 'Recommended',
    status_compatible: 'Compatible',
    status_warning: 'Warning',
    status_incompatible: 'Incompatible',
    status_why: 'Why unavailable?',

    eng_check: 'Engineering Check',
    eng_valid: 'Configuration Valid',
    eng_attention: 'Requires Attention',
    eng_invalid: 'Configuration Not Valid',
    eng_passed: 'PASS',
    eng_warn: 'WARNING',
    eng_fail: 'FAIL',

    perf_rated_thrust: 'Rated Thrust',
    perf_peak_thrust: 'Peak Thrust',
    perf_max_speed: 'Max Speed',
    perf_accel: 'Acceleration',
    perf_stroke: 'Stroke',
    perf_repeatability: 'Repeatability',
    perf_motor_rpm: 'Motor RPM',
    perf_motor_torque: 'Motor Torque',
    perf_safety: 'Safety Factor',
    perf_life: 'Estimated Life',
    perf_payload: 'Payload',

    unit_n: 'N',
    unit_mm_s: 'mm/s',
    unit_mm: 'mm',
    unit_rpm: 'rpm',
    unit_nm: 'N·m',
    unit_h: 'h',
    unit_g: 'g',

    view_side: 'Side View',
    view_transmission: 'Transmission',
    view_exploded: 'Exploded',
    label_motor: 'Motor',
    label_carriage: 'Carriage',
    label_rod: 'Rod',
    label_rod_end: 'Rod End',
    label_body: 'Body',
    label_screw: 'Screw',
    label_belt: 'Belt',
    label_coupling: 'Coupling',
    label_bearing: 'Bearing',

    review_your_config: 'Your Configuration',
    review_config_id: 'Configuration ID',
    review_copy: 'Copy',
    review_download_json: 'Download Configuration JSON',
    review_download_bom: 'Download BOM CSV',
    review_cad_disabled: 'CAD integration will be available after product data service is connected.',

    quote_title: 'Request Engineering Quote',
    quote_company: 'Company',
    quote_name: 'Name',
    quote_email: 'Email',
    quote_phone: 'Phone',
    quote_country: 'Country',
    quote_application: 'Application',
    quote_quantity: 'Project Quantity',
    quote_delivery: 'Expected Delivery Date',
    quote_message: 'Message',
    quote_submit: 'Submit Request',
    quote_success: 'Request Prepared',
    quote_demo_note: 'Demo submission — backend integration required for production.',
    quote_copy_json: 'Copy Request JSON',

    common_demo: 'Demo',
    common_demo_notice: 'Demo engineering data. Final values are subject to verified product specifications.',
    common_not_configured: 'Not configured',
    common_loading: 'Loading…',
    common_basic: 'Basic',
    common_advanced: 'Advanced',
    common_why_unavailable: 'Why unavailable?',
  },
} as const;

export type TranslationKey = keyof typeof translations.zh;

interface I18nContextValue {
  lang: Language;
  t: (key: TranslationKey) => string;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'ecc-lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return saved === 'zh' || saved === 'en' ? saved : 'zh';
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] ?? translations.en[key] ?? key,
    [lang],
  );

  return <I18nContext.Provider value={{ lang, t, setLang }}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
