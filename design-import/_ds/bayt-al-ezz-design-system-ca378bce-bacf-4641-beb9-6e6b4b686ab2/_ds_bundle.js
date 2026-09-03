/* @ds-bundle: {"format":4,"namespace":"BaytAlEzzDesignSystem_ca378b","components":[{"name":"CartLine","sourcePath":"components/commerce/CartLine.jsx"},{"name":"EmptyState","sourcePath":"components/commerce/EmptyState.jsx"},{"name":"OrderSummary","sourcePath":"components/commerce/OrderSummary.jsx"},{"name":"PriceTag","sourcePath":"components/commerce/PriceTag.jsx"},{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardTitle","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"StatCard","sourcePath":"components/core/StatCard.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"SkeletonProductCard","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"QuantityStepper","sourcePath":"components/forms/QuantityStepper.jsx"},{"name":"SwatchGroup","sourcePath":"components/forms/SwatchGroup.jsx"},{"name":"ROOM_BOUNDS","sourcePath":"components/house/HouseHero.jsx"},{"name":"HouseHero","sourcePath":"components/house/HouseHero.jsx"},{"name":"RoomLabel","sourcePath":"components/house/RoomLabel.jsx"},{"name":"AdminSidebar","sourcePath":"components/navigation/AdminSidebar.jsx"},{"name":"Breadcrumbs","sourcePath":"components/navigation/Breadcrumbs.jsx"},{"name":"SearchBar","sourcePath":"components/navigation/SearchBar.jsx"},{"name":"SectionNav","sourcePath":"components/navigation/SectionNav.jsx"},{"name":"StoreFooter","sourcePath":"components/navigation/StoreFooter.jsx"},{"name":"StoreHeader","sourcePath":"components/navigation/StoreHeader.jsx"}],"sourceHashes":{"components/commerce/CartLine.jsx":"0b27b52184b9","components/commerce/EmptyState.jsx":"7778419c8920","components/commerce/OrderSummary.jsx":"092e91fa1064","components/commerce/PriceTag.jsx":"bd0c4eb14ac4","components/commerce/ProductCard.jsx":"d9b0ea1a4b2e","components/core/Badge.jsx":"387fd924b610","components/core/Button.jsx":"b4ea2542dd65","components/core/Card.jsx":"0b46945cbd11","components/core/Icon.jsx":"a195df23cd7a","components/core/IconButton.jsx":"ebc10938ff8d","components/core/StatCard.jsx":"ae62e2c4ec62","components/feedback/Modal.jsx":"847c98dcb563","components/feedback/Skeleton.jsx":"418544281378","components/forms/Input.jsx":"76e8e6817a99","components/forms/QuantityStepper.jsx":"fd32bcd810e2","components/forms/SwatchGroup.jsx":"6ec1a31500c2","components/house/HouseHero.jsx":"e2ca6ad18622","components/house/RoomLabel.jsx":"435345758adb","components/navigation/AdminSidebar.jsx":"1205bb526874","components/navigation/Breadcrumbs.jsx":"386c91546601","components/navigation/SearchBar.jsx":"19666a271b68","components/navigation/SectionNav.jsx":"ae292dfdaedc","components/navigation/StoreFooter.jsx":"51a8ff9b42d6","components/navigation/StoreHeader.jsx":"b34f5783d73c","ui_kits/admin/AdminShell.jsx":"e7864f5c9eb3","ui_kits/admin/DashboardScreen.jsx":"7d6f18eac510","ui_kits/admin/LoginScreen.jsx":"35428e7f8cfa","ui_kits/admin/ProductsScreen.jsx":"2a8e3eacc1c0","ui_kits/admin/SectionsScreen.jsx":"90b8be0b50c3","ui_kits/admin/app.jsx":"80862ceca297","ui_kits/storefront/CartScreen.jsx":"b28153600919","ui_kits/storefront/CategoryScreen.jsx":"4a46f6b78d74","ui_kits/storefront/HomeScreen.jsx":"7c907e377277","ui_kits/storefront/ProductScreen.jsx":"0cf27bbfe1a1","ui_kits/storefront/app.jsx":"67235568da6d","ui_kits/storefront/data.jsx":"14a264f22a7d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BaytAlEzzDesignSystem_ca378b = window.BaytAlEzzDesignSystem_ca378b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/commerce/OrderSummary.jsx
try { (() => {
/** Cart order-summary panel: subtotal, deferred delivery cost, provisional total,
 *  then the WhatsApp send + copy-order pair. Sticky under the header on desktop. */
function OrderSummary({
  subtotal = 0,
  onSend,
  onCopy,
  disabled = false,
  style
}) {
  const money = v => `${Math.round(Number(v) || 0)} ج.م`;
  const [sent, setSent] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 16px',
      paddingBottom: '8px',
      borderBottom: '1px solid var(--border-hairline-soft)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, "\u0645\u0644\u062E\u0635 \u0627\u0644\u0637\u0644\u0628"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '24px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064A"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, money(subtotal))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0644"), /*#__PURE__*/React.createElement("span", null, "\u062A\u062D\u062F\u062F \u0644\u0627\u062D\u0642\u0627\u064B")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '12px',
      borderTop: '1px solid var(--border-hairline-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, "\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0624\u0642\u062A"), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--fw-extrabold)',
      color: 'var(--text-price)'
    }
  }, money(subtotal)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement(SummaryButton, {
    primary: true,
    disabled: disabled,
    icon: sent ? 'done' : 'send',
    label: sent ? 'تم الإرسال ✓' : 'إرسال الطلب عبر واتساب',
    onClick: () => {
      if (disabled) return;
      setSent(true);
      if (onSend) onSend();
      setTimeout(() => setSent(false), 1500);
    }
  }), /*#__PURE__*/React.createElement(SummaryButton, {
    icon: copied ? 'done' : 'content_copy',
    label: copied ? 'تم النسخ ✓' : 'نسخ نص الطلب',
    onClick: () => {
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 1200);
    }
  })));
}
function SummaryButton({
  primary,
  icon,
  label,
  onClick,
  disabled
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const bg = disabled ? 'var(--action-disabled)' : primary ? hover ? 'var(--action-primary-hover)' : 'var(--action-primary)' : hover ? 'var(--gray-50)' : 'var(--surface-card)';
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      background: bg,
      color: primary ? disabled ? 'var(--action-disabled-text)' : '#fff' : 'var(--secondary-navy)',
      border: primary ? '1px solid transparent' : '1px solid var(--border-input)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 24px',
      fontFamily: 'var(--font-core)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-bold)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: primary && !disabled ? 'var(--shadow-md)' : 'none',
      transform: press ? 'scale(var(--press-scale))' : 'scale(1)',
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '20px'
    }
  }, icon), /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { OrderSummary });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/OrderSummary.jsx", error: String((e && e.message) || e) }); }

// components/commerce/PriceTag.jsx
try { (() => {
/** Price display. Retail = brand blue; wholesale = amber. Optional "بداية من" prefix
 *  when a product's variants differ in price. Currency is always "ج.م", rounded, no decimals. */
function PriceTag({
  value,
  wholesale = false,
  startingFrom = false,
  size = 'md',
  label,
  style
}) {
  const sizes = {
    sm: 'var(--text-sm)',
    md: 'var(--text-lg)',
    lg: 'var(--text-2xl)',
    xl: 'var(--text-3xl)'
  };
  const color = wholesale ? 'var(--text-price-wholesale)' : 'var(--text-price)';
  const amount = `${Math.round(Number(value) || 0)} ج.م`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: sizes[size] || sizes.md,
      fontWeight: 'var(--fw-extrabold)',
      color,
      lineHeight: 1.3
    }
  }, startingFrom ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-body)',
      marginInlineEnd: '4px'
    }
  }, "\u0628\u062F\u0627\u064A\u0629 \u0645\u0646") : null, amount));
}
Object.assign(__ds_scope, { PriceTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/PriceTag.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCard.jsx
try { (() => {
/** Storefront product card: square image well, name, 2-line description, price + add-to-cart.
 *  Whole card is a link; the CTA sits above it on z-20. Image zooms 1.05 on card hover. */
function ProductCard({
  name,
  description,
  image,
  price,
  wholesale = false,
  startingFrom = false,
  inStock = true,
  onAdd,
  onOpen,
  href = '#',
  style
}) {
  const [hover, setHover] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  return /*#__PURE__*/React.createElement("article", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      border: '1px solid ' + (hover ? 'var(--primary-blue)' : 'var(--border-hairline)'),
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: hover ? 'var(--shadow-md)' : 'none',
      transition: 'all var(--dur-base) var(--ease-standard)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    "aria-label": name,
    onClick: e => {
      if (onOpen) {
        e.preventDefault();
        onOpen();
      }
    },
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '1 / 1',
      width: '100%',
      background: 'var(--surface-sunken)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      padding: '12%',
      boxSizing: 'border-box',
      transform: hover ? 'scale(var(--hover-zoom))' : 'scale(1)',
      transition: 'transform var(--dur-slow) var(--ease-standard)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px',
      fontSize: 'var(--text-lg)',
      lineHeight: 'var(--lh-lg)',
      fontWeight: 'var(--fw-bold)',
      color: hover ? 'var(--primary-blue)' : 'var(--text-heading)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition: 'color var(--dur-fast) var(--ease-standard)'
    }
  }, name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 16px',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--lh-sm)',
      color: 'var(--text-body)',
      flexGrow: 1,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, description), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      marginTop: 'auto',
      paddingTop: '12px',
      borderTop: '1px solid var(--border-hairline-soft)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PriceTag, {
    value: price,
    wholesale: wholesale,
    startingFrom: startingFrom,
    style: {
      position: 'relative',
      zIndex: 20
    }
  }), inStock ? /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.preventDefault();
      setAdded(true);
      if (onAdd) onAdd();
      setTimeout(() => setAdded(false), 1500);
    },
    style: {
      position: 'relative',
      zIndex: 20,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: added ? 'var(--success-600)' : hover ? 'var(--primary-blue)' : 'var(--secondary-navy)',
      color: '#fff',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-bold)',
      fontFamily: 'var(--font-core)',
      padding: '8px 16px',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", null, added ? 'تم ✓' : 'أضف للسلة'), /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '14px'
    }
  }, added ? 'done' : 'shopping_cart')) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 20,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: 'var(--action-disabled)',
      color: 'var(--action-disabled-text)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-bold)',
      padding: '8px 16px',
      borderRadius: 'var(--radius-md)',
      cursor: 'not-allowed'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631"), /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '14px'
    }
  }, "info")))));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  brand: {
    background: 'var(--primary-blue-10)',
    color: 'var(--primary-blue)',
    border: 'transparent'
  },
  navy: {
    background: 'var(--navy-10)',
    color: 'var(--secondary-navy)',
    border: 'transparent'
  },
  neutral: {
    background: 'var(--gray-100)',
    color: 'var(--gray-600)',
    border: 'transparent'
  },
  wholesale: {
    background: 'var(--wholesale-50)',
    color: 'var(--wholesale-800)',
    border: 'var(--wholesale-200)'
  },
  success: {
    background: 'var(--success-50)',
    color: 'var(--success-700)',
    border: 'var(--success-300)'
  },
  danger: {
    background: 'var(--danger-50)',
    color: 'var(--danger-500)',
    border: 'var(--danger-200)'
  },
  count: {
    background: 'var(--danger-500)',
    color: '#fff',
    border: 'transparent'
  }
};

/** Small status/label pill: section tag, stock warning, cart count, wholesale flag. */
function Badge({
  tone = 'brand',
  size = 'md',
  icon,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.brand;
  const sizes = {
    sm: {
      fontSize: 'var(--text-2xs)',
      padding: '2px 6px'
    },
    md: {
      fontSize: 'var(--text-xs)',
      padding: '4px 12px'
    }
  };
  const s = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: t.background,
      color: t.color,
      border: '1px solid ' + t.border,
      borderRadius: 'var(--radius-pill)',
      fontWeight: 'var(--fw-bold)',
      fontFamily: 'var(--font-core)',
      ...s,
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '14px'
    }
  }, icon) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    fontSize: 'var(--text-sm)',
    padding: '8px 16px',
    gap: '4px'
  },
  md: {
    fontSize: 'var(--text-sm)',
    padding: '10px 24px',
    gap: '8px'
  },
  lg: {
    fontSize: 'var(--text-base)',
    padding: '12px 32px',
    gap: '8px'
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--action-primary)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-md)'
  },
  navy: {
    background: 'var(--action-secondary)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
    boxShadow: 'none'
  },
  secondary: {
    background: 'var(--surface-card)',
    color: 'var(--secondary-navy)',
    border: '1px solid var(--border-input)',
    boxShadow: 'none'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--neutral-gray)',
    border: '1px solid transparent',
    boxShadow: 'none'
  },
  wholesale: {
    background: 'var(--action-wholesale)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-sm)'
  },
  success: {
    background: 'var(--success-600)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
    boxShadow: 'var(--shadow-md)'
  }
};
const HOVER = {
  primary: 'var(--action-primary-hover)',
  navy: 'var(--primary-blue)',
  secondary: 'var(--gray-50)',
  ghost: 'var(--gray-100)',
  wholesale: 'var(--wholesale-700)',
  success: 'var(--success-700)'
};

/** Bayt Al-Ezz's one button. Pill-less: 12px radius, bold Cairo, icon + label, press-scales to 0.95. */
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconAfter,
  fullWidth = false,
  disabled = false,
  as = 'button',
  href,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const Tag = as === 'a' ? 'a' : 'button';
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    fontSize: s.fontSize,
    fontFamily: 'var(--font-core)',
    fontWeight: 'var(--fw-bold)',
    lineHeight: 1.4,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    transition: 'background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard),transform var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard)',
    transform: press && !disabled ? 'scale(var(--press-scale))' : 'scale(1)',
    ...v
  };
  if (disabled) {
    base.background = 'var(--action-disabled)';
    base.color = 'var(--action-disabled-text)';
    base.boxShadow = 'none';
    base.borderColor = 'transparent';
  } else if (hover) {
    base.background = HOVER[variant] || base.background;
  }
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    disabled: Tag === 'button' ? disabled : undefined,
    style: {
      ...base,
      ...style
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false)
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: size === 'sm' ? '14px' : '20px'
    }
  }, icon) : null, /*#__PURE__*/React.createElement("span", null, children), iconAfter ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: size === 'sm' ? '14px' : '20px'
    }
  }, iconAfter) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/commerce/EmptyState.jsx
try { (() => {
/** The storefront's empty/error state: big grey glyph, navy title, grey line, one blue CTA.
 *  Used for empty cart, empty section, no search results, product-not-found and load errors. */
function EmptyState({
  icon = 'folder_open',
  tone = 'neutral',
  title,
  description,
  actionLabel,
  actionIcon = 'home',
  onAction,
  href,
  style
}) {
  const tones = {
    neutral: 'var(--neutral-gray)',
    danger: 'var(--danger-500)',
    wholesale: 'var(--wholesale-500)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '64px 32px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '60px',
      color: tones[tone] || tones.neutral,
      marginBottom: '16px'
    }
  }, icon), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px',
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 24px',
      color: 'var(--text-body)',
      maxWidth: '46ch'
    }
  }, description), actionLabel ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    icon: actionIcon,
    size: "md",
    onClick: onAction,
    as: href ? 'a' : 'button',
    href: href
  }, actionLabel) : null);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The universal surface: white, 20%-grey hairline, 16px radius, whisper shadow. */
function Card({
  padding = '24px',
  radius = 'lg',
  hoverable = false,
  as = 'div',
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const radii = {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)'
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid ' + (hoverable && hover ? 'var(--primary-blue)' : 'var(--border-hairline)'),
      borderRadius: radii[radius] || radii.lg,
      padding,
      boxShadow: hoverable && hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transition: 'border-color var(--dur-base) var(--ease-standard),box-shadow var(--dur-base) var(--ease-standard)',
      ...style
    }
  }, rest), children);
}

/** Card heading with the 10%-grey rule underneath — used on every panel header. */
function CardTitle({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--text-lg)',
      lineHeight: 'var(--lh-lg)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)',
      paddingBottom: '8px',
      marginBottom: '16px',
      borderBottom: '1px solid var(--border-hairline-soft)',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card, CardTitle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Material Symbols Outlined glyph. The storefront's only icon system —
 * every `<span class="material-symbols-outlined">name</span>` in the source.
 */
function Icon({
  name,
  size = 20,
  fill = false,
  color = 'currentColor',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: 'material-symbols-outlined' + (fill ? ' fill-icon' : ''),
    style: {
      fontFamily: 'var(--font-icon)',
      fontSize: size + 'px',
      color,
      lineHeight: 1,
      display: 'inline-block',
      verticalAlign: 'middle',
      ...style
    }
  }, rest), name);
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Circular icon-only control: header actions (on navy) and cart qty steppers (on grey). */
function IconButton({
  icon,
  tone = 'on-navy',
  size = 40,
  badge,
  label,
  as = 'button',
  href,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const tones = {
    'on-navy': {
      color: '#fff',
      background: hover ? 'var(--white-10)' : 'transparent',
      radius: 'var(--radius-pill)'
    },
    'on-light': {
      color: hover ? 'var(--primary-blue)' : 'var(--neutral-gray)',
      background: hover ? 'var(--surface-card)' : 'transparent',
      radius: 'var(--radius-sm)'
    },
    'danger': {
      color: hover ? 'var(--danger-500)' : 'var(--gray-400)',
      background: 'transparent',
      radius: 'var(--radius-pill)'
    }
  };
  const t = tones[tone] || tones['on-navy'];
  const Tag = as === 'a' ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick,
    "aria-label": label,
    title: label,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size + 'px',
      height: size + 'px',
      border: 'none',
      cursor: 'pointer',
      background: t.background,
      color: t.color,
      borderRadius: t.radius,
      transform: press ? 'scale(var(--press-scale))' : 'scale(1)',
      transition: 'background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard),transform var(--dur-fast) var(--ease-standard)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: size >= 40 ? '24px' : '16px'
    }
  }, icon), badge !== undefined && badge !== null && badge !== 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '-4px',
      insetInlineEnd: '-4px',
      background: 'var(--danger-500)',
      color: '#fff',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--fw-bold)',
      borderRadius: 'var(--radius-pill)',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, badge) : null);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatCard.jsx
try { (() => {
/** Admin bento stat: tinted icon square + label + black number. */
function StatCard({
  icon,
  label,
  value,
  tone = 'brand',
  style
}) {
  const tones = {
    brand: {
      bg: 'var(--primary-blue-10)',
      fg: 'var(--primary-blue)'
    },
    navy: {
      bg: 'var(--navy-10)',
      fg: 'var(--secondary-navy)'
    }
  };
  const t = tones[tone] || tones.brand;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '48px',
      height: '48px',
      borderRadius: 'var(--radius-md)',
      background: t.bg,
      color: t.fg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '24px'
    }
  }, icon)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-regular)',
      color: 'var(--text-body)'
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-2xl)',
      lineHeight: 'var(--lh-2xl)',
      fontWeight: 'var(--fw-black)',
      color: 'var(--text-heading)'
    }
  }, value)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
/** Centred confirmation dialog on a blurred black scrim: tinted glyph disc, title,
 *  supporting line, one full-width action. (The post-order thank-you modal.) */
function Modal({
  open = true,
  icon = 'favorite',
  title,
  description,
  actionLabel = 'حسناً',
  onClose,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget) onClose && onClose();
    },
    role: "dialog",
    "aria-modal": "true",
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--scrim)',
      backdropFilter: 'var(--backdrop-blur-modal)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-2xl)',
      maxWidth: '384px',
      width: '100%',
      margin: '0 16px',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '20px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '80px',
      height: '80px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--primary-blue-10)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '48px',
      color: 'var(--primary-blue)'
    }
  }, icon)), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--fw-extrabold)',
      color: 'var(--text-heading)',
      lineHeight: 'var(--leading-snug)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, description), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    fullWidth: true,
    size: "lg",
    onClick: onClose,
    style: {
      marginTop: '8px'
    }
  }, actionLabel)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
/** Grey pulsing placeholder. The storefront's only loading device — every page
 *  ships a skeleton of the layout it is about to render. */
function Skeleton({
  width = '100%',
  height = '16px',
  radius = '4px',
  style
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, '@keyframes bae-pulse{0%,100%{opacity:1}50%{opacity:.5}}'), /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: radius,
      background: 'var(--gray-200)',
      animation: 'bae-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      ...style
    }
  }));
}

/** Skeleton shaped like a ProductCard — image well, title line, price, button. */
function SkeletonProductCard({
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      ...style
    }
  }, /*#__PURE__*/React.createElement(Skeleton, {
    height: "0",
    style: {
      aspectRatio: '1 / 1',
      height: 'auto',
      borderRadius: 'var(--radius-md)'
    }
  }), /*#__PURE__*/React.createElement(Skeleton, {
    width: "66%",
    height: "16px"
  }), /*#__PURE__*/React.createElement(Skeleton, {
    width: "33%",
    height: "24px"
  }), /*#__PURE__*/React.createElement(Skeleton, {
    height: "40px",
    style: {
      borderRadius: 'var(--radius-md)'
    }
  }));
}
Object.assign(__ds_scope, { Skeleton, SkeletonProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Admin/form text field: 12px radius, grey-300 border, blue focus ring. */
function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  name,
  required,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-heading)',
      marginBottom: '6px'
    }
  }, label) : null, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    name: name,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    required: required,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-md)',
      border: '1px solid ' + (error ? 'var(--danger-500)' : focus ? 'var(--border-focus)' : 'var(--border-input)'),
      boxShadow: focus ? '0 0 0 1px var(--border-focus)' : 'none',
      padding: '12px 16px',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-core)',
      color: 'var(--text-heading)',
      background: 'var(--surface-card)',
      outline: 'none',
      transition: 'border-color var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard)'
    }
  }, rest)), error ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--danger-500)',
      textAlign: 'center'
    }
  }, error) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/QuantityStepper.jsx
try { (() => {
/** Quantity stepper from the cart line: −  n  + inside a grey rounded well. */
function QuantityStepper({
  value = 1,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-md)',
      padding: '4px',
      ...style
    }
  }, /*#__PURE__*/React.createElement(Step, {
    icon: "remove",
    onClick: () => onChange && onChange(Math.max(0, value - 1))
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--text-sm)',
      width: '24px',
      textAlign: 'center',
      color: 'var(--text-heading)'
    }
  }, value), /*#__PURE__*/React.createElement(Step, {
    icon: "add",
    onClick: () => onChange && onChange(value + 1)
  }));
}
function Step({
  icon,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      width: '32px',
      height: '32px',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: hover ? 'var(--surface-card)' : 'transparent',
      color: hover ? 'var(--primary-blue)' : 'var(--neutral-gray)',
      transform: press ? 'scale(var(--press-scale))' : 'scale(1)',
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '14px'
    }
  }, icon));
}
Object.assign(__ds_scope, { QuantityStepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/QuantityStepper.jsx", error: String((e && e.message) || e) }); }

// components/commerce/CartLine.jsx
try { (() => {
/** One row in the cart: thumbnail, name + variant details, price, stepper, line total,
 *  plus a delete affordance pinned to the card's inline-start corner. */
function CartLine({
  name,
  details,
  image,
  price,
  quantity = 1,
  stale = false,
  onQuantity,
  onRemove,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const money = v => `${Math.round(Number(v) || 0)} ج.م`;
  return /*#__PURE__*/React.createElement("article", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      border: '1px solid ' + (hover ? 'var(--primary-blue)' : 'var(--border-hairline)'),
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      transition: 'border-color var(--dur-base) var(--ease-standard)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '80px',
      height: '80px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--gray-100)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      padding: '8px',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flexGrow: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 4px',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, name), details ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 8px',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)'
    }
  }, details) : null, stale ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--danger-500)',
      background: 'var(--danger-50)',
      padding: '2px 8px',
      borderRadius: '4px',
      border: '1px solid var(--danger-200)'
    }
  }, "\u0627\u0644\u0645\u0646\u062A\u062C \u062F\u0647 \u0645\u0628\u0642\u0627\u0634 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-price)'
    }
  }, money(price))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }
  }, stale ? /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--danger-500)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-semibold)',
      fontFamily: 'var(--font-core)',
      textDecoration: 'underline'
    }
  }, "\u062D\u0630\u0641") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.QuantityStepper, {
    value: quantity,
    onChange: onQuantity
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-extrabold)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-heading)',
      minWidth: '70px',
      textAlign: 'left'
    }
  }, money(price * quantity)))), /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    title: "\u0625\u0632\u0627\u0644\u0629",
    "aria-label": "\u0625\u0632\u0627\u0644\u0629",
    style: {
      position: 'absolute',
      top: '16px',
      insetInlineStart: '16px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--gray-400)',
      padding: '4px',
      lineHeight: 0,
      transition: 'color var(--dur-fast) var(--ease-standard)'
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--danger-500)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--gray-400)'
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '20px'
    }
  }, "delete")));
}
Object.assign(__ds_scope, { CartLine });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/CartLine.jsx", error: String((e && e.message) || e) }); }

// components/forms/SwatchGroup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Pill selector used for product variants, sizes and colours on the product page.
 *  Selected = 10% blue fill + blue border + 25% ring. Out of stock = 40% opacity + strikethrough. */
function SwatchGroup({
  label,
  options = [],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '24px',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 8px',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    }
  }, options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o,
      inStock: true
    } : {
      inStock: true,
      label: o.value,
      ...o
    };
    const selected = opt.value === value;
    const disabled = opt.inStock === false;
    return /*#__PURE__*/React.createElement(Swatch, _extends({
      key: opt.value
    }, opt, {
      selected: selected,
      disabled: disabled,
      onClick: () => {
        if (!disabled && onChange) onChange(opt.value);
      }
    }));
  })));
}
function Swatch({
  label,
  selected,
  disabled,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  let s = {
    background: 'var(--surface-card)',
    color: 'var(--text-body)',
    border: '1px solid var(--gray-200)',
    boxShadow: 'none',
    fontWeight: 'var(--fw-regular)',
    opacity: 1,
    textDecoration: 'none',
    cursor: 'pointer'
  };
  if (disabled) s = {
    ...s,
    opacity: .4,
    textDecoration: 'line-through',
    background: 'var(--gray-100)',
    color: 'var(--gray-400)',
    border: '1px solid var(--gray-200)',
    cursor: 'not-allowed'
  };else if (selected) s = {
    ...s,
    background: 'var(--primary-blue-10)',
    color: 'var(--primary-blue)',
    border: '1px solid var(--primary-blue)',
    boxShadow: '0 0 0 2px var(--primary-blue-25)',
    fontWeight: 'var(--fw-bold)'
  };else if (hover) s = {
    ...s,
    border: '1px solid var(--primary-blue)',
    color: 'var(--primary-blue)'
  };
  return /*#__PURE__*/React.createElement("button", {
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      padding: '8px 16px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-core)',
      transition: 'all var(--dur-fast) var(--ease-standard)',
      ...s
    }
  }, label);
}
Object.assign(__ds_scope, { SwatchGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SwatchGroup.jsx", error: String((e && e.message) || e) }); }

// components/house/RoomLabel.jsx
try { (() => {
/** One room tile on the house hero: silhouette icon over an extra-bold Arabic label,
 *  translucent white, blurred, lifting 2px into brand blue on hover.
 *  `gift` renders the roof triangle treatment instead (clipped, solid house-navy). */
function RoomLabel({
  name,
  icon,
  gift = false,
  open = true,
  delay = 0,
  bounds,
  iconBase = 'assets/icons/',
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const geometry = gift ? {
    left: '1.71%',
    top: '2.49%',
    width: '95.95%',
    height: '22.51%'
  } : bounds || {};
  const giftStyle = {
    background: hover ? 'var(--gift-navy-hover)' : 'var(--gift-navy)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-none)',
    clipPath: 'polygon(50% 0%,100% 100%,0% 100%)',
    boxShadow: hover ? 'var(--shadow-gift-hover)' : 'var(--shadow-gift)',
    backdropFilter: 'none',
    justifyContent: 'flex-end',
    paddingBottom: '8%',
    filter: hover ? 'brightness(1.1)' : 'none',
    transform: open ? hover ? 'translateY(-3px)' : 'translateY(0)' : 'translateY(-10px)'
  };
  const roomStyle = {
    background: hover ? 'var(--primary-blue)' : 'rgba(248,249,250,.95)',
    color: hover ? 'var(--base-white)' : 'var(--secondary-navy)',
    border: '1px solid rgba(158,158,158,.3)',
    borderRadius: '20px',
    backdropFilter: 'var(--backdrop-blur-label)',
    boxShadow: hover ? 'var(--shadow-room-label-hover)' : 'var(--shadow-room-label)',
    justifyContent: 'center',
    padding: '12px',
    transform: open ? hover ? 'translateY(var(--hover-lift))' : 'translateY(0)' : 'translateY(15px)'
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    "aria-label": name,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'absolute',
      ...geometry,
      boxSizing: 'border-box',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      textAlign: 'center',
      fontFamily: 'var(--font-core)',
      fontWeight: 'var(--fw-extrabold)',
      opacity: open ? 1 : 0,
      transitionDelay: delay + 'ms',
      transition: 'opacity var(--dur-slow) var(--ease-entrance),transform var(--dur-slow) var(--ease-entrance),background var(--dur-fast),color var(--dur-fast),box-shadow var(--dur-fast)',
      ...(gift ? giftStyle : roomStyle),
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement("img", {
    src: iconBase + icon,
    alt: "",
    style: {
      width: 'clamp(1.5rem,10cqi,5rem)',
      height: 'clamp(1.5rem,10cqi,5rem)',
      objectFit: 'contain',
      pointerEvents: 'none',
      marginBottom: '4px',
      filter: hover && !gift ? 'invert(1) brightness(2)' : 'none'
    }
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'clamp(.7rem,3.2cqi,1.3rem)',
      lineHeight: 1.3
    }
  }, name));
}
Object.assign(__ds_scope, { RoomLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/house/RoomLabel.jsx", error: String((e && e.message) || e) }); }

// components/house/HouseHero.jsx
try { (() => {
/* Room geometry read straight off assets/Frame 2.svg (viewBox 2048×2048),
   expressed as percentages with the same 1.5% inset the storefront applies. */
const INSET = 1.5;
const RAW = {
  laundry: [38, 527, 498.5, 512.5],
  'kitchen-shelving': [537.5, 527, 480, 512.5],
  'paper-goods': [1017.5, 527, 481, 512.5],
  bathroom: [1498.5, 527, 491.5, 512.5],
  women: [38, 1039.5, 498.5, 471],
  men: [537.5, 1039.5, 480, 471],
  reception: [1017.5, 1039.5, 481, 471],
  baby: [1498.5, 1039.5, 491.5, 471],
  footwear: [38, 1510.5, 498.5, 492.5],
  vanity: [537.5, 1510.5, 480, 492.5],
  garage: [1017.5, 1510.5, 481, 492.5],
  cleaning: [1498.5, 1510.5, 491.5, 492.5]
};
const ROOM_BOUNDS = Object.fromEntries(Object.entries(RAW).map(([k, [x, y, w, h]]) => [k, {
  left: x / 2048 * 100 + INSET + '%',
  top: y / 2048 * 100 + INSET + '%',
  width: w / 2048 * 100 - INSET * 2 + '%',
  height: h / 2048 * 100 - INSET * 2 + '%'
}]));

/**
 * The brand's signature hero: a 12-room house floorplan that "opens" two seconds
 * after landing — a closed frame crossfades to the grid frame while room labels
 * rise into place on a 35 ms-per-room stagger. Each label routes to its section.
 */
function HouseHero({
  sections = [],
  giftSection,
  onSelect,
  autoOpen = true,
  openDelay = 2000,
  frameClosed = 'assets/Frame 1.svg',
  frameOpen = 'assets/Frame 2.svg',
  iconBase = 'assets/icons/',
  style
}) {
  const [open, setOpen] = React.useState(!autoOpen);
  React.useEffect(() => {
    if (!autoOpen) return;
    const t = setTimeout(() => setOpen(true), openDelay);
    return () => clearTimeout(t);
  }, [autoOpen, openDelay]);
  return /*#__PURE__*/React.createElement("section", {
    onClick: () => {
      if (!open) setOpen(true);
    },
    style: {
      position: 'relative',
      width: 'min(100%,var(--house-max))',
      aspectRatio: '1 / 1',
      margin: '0 auto',
      containerType: 'inline-size',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-hairline)',
      boxShadow: 'var(--shadow-xl)',
      overflow: 'hidden',
      ...style
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: frameClosed,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: open ? 0 : 1,
      transition: 'opacity var(--dur-frame) var(--ease-standard)'
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: frameOpen,
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      opacity: open ? 1 : 0,
      transition: 'opacity var(--dur-frame) var(--ease-standard)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 20
    }
  }, giftSection ? /*#__PURE__*/React.createElement(__ds_scope.RoomLabel, {
    gift: true,
    name: giftSection.name,
    open: open,
    delay: 0,
    iconBase: iconBase,
    onClick: () => onSelect && onSelect(giftSection)
  }) : null, sections.map((s, i) => {
    const bounds = ROOM_BOUNDS[s.slug];
    if (!bounds) return null;
    return /*#__PURE__*/React.createElement(__ds_scope.RoomLabel, {
      key: s.slug,
      name: s.name,
      icon: s.icon,
      bounds: bounds,
      open: open,
      delay: i * 35,
      iconBase: iconBase,
      onClick: () => onSelect && onSelect(s)
    });
  })));
}
Object.assign(__ds_scope, { ROOM_BOUNDS, HouseHero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/house/HouseHero.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AdminSidebar.jsx
try { (() => {
/** Fixed merchant-dashboard sidebar, anchored to the inline-start edge (right in RTL). */
function AdminSidebar({
  items = [],
  active,
  onSelect,
  onLogout,
  style
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--admin-sidebar-width)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderInlineStart: '1px solid var(--border-hairline)',
      boxShadow: 'var(--shadow-xl)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px',
      borderBottom: '1px solid var(--border-hairline-soft)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-extrabold)',
      fontSize: 'var(--text-xl)',
      color: 'var(--primary-blue)',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, "\u0628\u064A\u062A \u0627\u0644\u0639\u0632"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)'
    }
  }, "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u062A\u0627\u062C\u0631")), /*#__PURE__*/React.createElement("nav", {
    style: {
      flexGrow: 1,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, items.map(it => /*#__PURE__*/React.createElement(NavItem, {
    key: it.id,
    item: it,
    active: it.id === active,
    onSelect: onSelect
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      borderTop: '1px solid var(--border-hairline-soft)'
    }
  }, /*#__PURE__*/React.createElement(LogoutButton, {
    onClick: onLogout
  })));
}
function NavItem({
  item,
  active,
  onSelect
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => onSelect && onSelect(item),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      width: '100%',
      textAlign: 'start',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontFamily: 'var(--font-core)',
      fontSize: 'var(--text-sm)',
      background: active ? 'var(--primary-blue-10)' : hover ? 'var(--gray-100)' : 'transparent',
      color: active ? 'var(--primary-blue)' : hover ? 'var(--secondary-navy)' : 'var(--text-body)',
      fontWeight: active ? 'var(--fw-bold)' : 'var(--fw-regular)',
      border: 'none',
      borderInlineEnd: active ? '4px solid var(--primary-blue)' : '4px solid transparent',
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '24px'
    }
  }, item.icon), /*#__PURE__*/React.createElement("span", null, item.label));
}
function LogoutButton({
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-core)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-bold)',
      background: hover ? 'var(--danger-50)' : 'var(--navy-05)',
      color: hover ? 'var(--danger-600)' : 'var(--secondary-navy)',
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '20px'
    }
  }, "logout"), /*#__PURE__*/React.createElement("span", null, "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"));
}
Object.assign(__ds_scope, { AdminSidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AdminSidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumbs.jsx
try { (() => {
/** RTL breadcrumb trail. Separator is a chevron_left glyph (points "forward" in RTL). */
function Breadcrumbs({
  items = [],
  onNavigate,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb",
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      listStyle: 'none',
      margin: 0,
      padding: 0
    }
  }, items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("li", null, last ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 'var(--fw-semibold)',
        color: 'var(--primary-blue)'
      }
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      href: it.href || '#',
      onClick: e => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(it);
        }
      },
      style: {
        color: 'inherit',
        textDecoration: 'none'
      },
      onMouseEnter: e => e.currentTarget.style.color = 'var(--primary-blue)',
      onMouseLeave: e => e.currentTarget.style.color = 'inherit'
    }, it.label)), !last ? /*#__PURE__*/React.createElement("li", {
      style: {
        lineHeight: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-symbols-outlined",
      style: {
        fontSize: '12px'
      }
    }, "chevron_left")) : null);
  })));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SearchBar.jsx
try { (() => {
/** Header search: translucent white pill on navy that turns solid white on focus,
 *  with a debounced dropdown of up to 5 product hits + a "view all" footer row. */
function SearchBar({
  value = '',
  onChange,
  onSubmit,
  results = null,
  onPick,
  placeholder = 'ابحث عن منتج...',
  style
}) {
  const [focus, setFocus] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const money = v => `${Math.round(Number(v) || 0)} ج.م`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      ...style
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSubmit && onSubmit(value);
    },
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: value,
    placeholder: placeholder,
    autoComplete: "off",
    onChange: e => {
      onChange && onChange(e.target.value);
      setOpen(true);
    },
    onFocus: () => {
      setFocus(true);
      setOpen(true);
    },
    onBlur: () => {
      setFocus(false);
      setTimeout(() => setOpen(false), 180);
    },
    style: {
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-pill)',
      padding: '8px 16px 8px 36px',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-core)',
      background: focus ? '#fff' : 'var(--white-15)',
      color: focus ? 'var(--secondary-navy)' : '#fff',
      border: '1px solid var(--white-30)',
      outline: 'none',
      boxShadow: 'var(--shadow-inner)',
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    "aria-label": "\u0628\u062D\u062B",
    style: {
      position: 'absolute',
      left: '10px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      lineHeight: 0,
      color: focus ? 'var(--secondary-navy)' : 'var(--white-70)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '18px'
    }
  }, "search"))), open && results ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      insetInlineStart: 0,
      insetInlineEnd: 0,
      top: '100%',
      marginTop: '8px',
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-2xl)',
      border: '1px solid var(--gray-200)',
      overflow: 'hidden',
      zIndex: 50,
      maxHeight: '320px',
      overflowY: 'auto',
      textAlign: 'right'
    }
  }, results.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      textAlign: 'center',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u062A\u0637\u0627\u0628\u0642 \"", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-bold)',
      color: 'var(--secondary-navy)'
    }
  }, value), "\"") : /*#__PURE__*/React.createElement(React.Fragment, null, results.slice(0, 5).map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p.id || i,
    onMouseDown: () => onPick && onPick(p),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      width: '100%',
      background: 'none',
      border: 'none',
      borderBottom: '1px solid var(--gray-100)',
      cursor: 'pointer',
      textAlign: 'inherit',
      fontFamily: 'var(--font-core)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--gray-50)',
    onMouseLeave: e => e.currentTarget.style.background = 'none'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      background: 'var(--gray-100)',
      border: '1px solid var(--gray-200)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.image,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      padding: '4px',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flexGrow: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--secondary-navy)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '2px'
    }
  }, p.section ? /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--gray-100)',
      color: 'var(--gray-600)',
      padding: '1px 6px',
      borderRadius: '4px',
      fontSize: 'var(--text-2xs)'
    }
  }, p.section) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--primary-blue)'
    }
  }, money(p.price)))))), /*#__PURE__*/React.createElement("button", {
    onMouseDown: () => onSubmit && onSubmit(value),
    style: {
      display: 'block',
      width: '100%',
      padding: '12px',
      textAlign: 'center',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--primary-blue)',
      background: 'var(--gray-50)',
      border: 'none',
      borderTop: '1px solid var(--gray-100)',
      cursor: 'pointer',
      fontFamily: 'var(--font-core)'
    }
  }, "\u0639\u0631\u0636 \u062C\u0645\u064A\u0639 \u0627\u0644\u0646\u062A\u0627\u0626\u062C (", results.length, ") \u2794"))) : null);
}
Object.assign(__ds_scope, { SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SearchBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SectionNav.jsx
try { (() => {
/** Room/section navigation. `variant="sidebar"` = icon + label rows with a 4px
 *  inline-end active bar (desktop); `variant="pills"` = horizontally scrolling
 *  filled pills (mobile). Icons are the brand's own silhouette SVGs. */
function SectionNav({
  sections = [],
  active,
  onSelect,
  variant = 'sidebar',
  iconBase = 'assets/icons/',
  style
}) {
  if (variant === 'pills') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '16px',
        ...style
      }
    }, sections.map(s => {
      const on = s.slug === active;
      return /*#__PURE__*/React.createElement("button", {
        key: s.slug,
        onClick: () => onSelect && onSelect(s),
        style: {
          flexShrink: 0,
          padding: '8px 16px',
          borderRadius: 'var(--radius-pill)',
          fontFamily: 'var(--font-core)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--fw-semibold)',
          cursor: 'pointer',
          background: on ? 'var(--primary-blue)' : 'var(--surface-card)',
          color: on ? '#fff' : 'var(--text-body)',
          border: '1px solid ' + (on ? 'var(--primary-blue)' : 'var(--gray-200)'),
          transition: 'all var(--dur-fast) var(--ease-standard)'
        }
      }, s.name);
    }));
  }
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      ...style
    }
  }, sections.map(s => /*#__PURE__*/React.createElement(SidebarLink, {
    key: s.slug,
    section: s,
    active: s.slug === active,
    onSelect: onSelect,
    iconBase: iconBase
  })));
}
function SidebarLink({
  section,
  active,
  onSelect,
  iconBase
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => onSelect && onSelect(section),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      width: '100%',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontFamily: 'var(--font-core)',
      fontSize: 'var(--text-sm)',
      textAlign: 'start',
      background: active ? 'var(--primary-blue-10)' : hover ? 'var(--gray-100)' : 'transparent',
      color: active ? 'var(--primary-blue)' : hover ? 'var(--secondary-navy)' : 'var(--text-body)',
      fontWeight: active ? 'var(--fw-bold)' : 'var(--fw-regular)',
      border: 'none',
      borderInlineEnd: active ? '4px solid var(--primary-blue)' : '4px solid transparent',
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: iconBase + (section.icon || 'laundry.svg'),
    alt: "",
    style: {
      width: '28px',
      height: '28px',
      objectFit: 'contain',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", null, section.name));
}
Object.assign(__ds_scope, { SectionNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SectionNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StoreFooter.jsx
try { (() => {
/** White footer with a top hairline: wordmark, three policy links, Arabic-numeral copyright. */
function StoreFooter({
  links = ['سياسة الخصوصية', 'الشروط والأحكام', 'اتصل بنا'],
  maxWidth = 'var(--container-6xl)',
  style
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-hairline)',
      padding: '24px 32px',
      marginTop: 'auto',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--text-lg)',
      color: 'var(--text-heading)'
    }
  }, "\u0628\u064A\u062A \u0627\u0644\u0639\u0632"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '24px'
    }
  }, links.map(l => /*#__PURE__*/React.createElement(FooterLink, {
    key: l,
    label: l
  }))), /*#__PURE__*/React.createElement("div", null, "\xA9 \u0662\u0660\u0662\u0666 \u0628\u064A\u062A \u0627\u0644\u0639\u0632. \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629")));
}
function FooterLink({
  label
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: "#",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      color: hover ? 'var(--primary-blue)' : 'inherit',
      textDecoration: 'none',
      transition: 'color var(--dur-fast) var(--ease-standard)'
    }
  }, label);
}
Object.assign(__ds_scope, { StoreFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StoreFooter.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StoreHeader.jsx
try { (() => {
/** Sticky navy storefront header: wordmark, translucent search, cart with count, admin link. */
function StoreHeader({
  cartCount = 0,
  children,
  onCart,
  onHome,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      background: 'var(--surface-header)',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '0 24px',
      height: 'var(--header-height)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-md)',
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onHome && onHome();
    },
    style: {
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--text-xl)',
      letterSpacing: 'var(--tracking-wide)',
      color: '#fff',
      textDecoration: 'none'
    }
  }, "\u0628\u064A\u062A \u0627\u0644\u0639\u0632")), /*#__PURE__*/React.createElement("div", {
    style: {
      flexGrow: 1,
      maxWidth: '448px',
      margin: '0 16px'
    }
  }, children), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(HeaderIcon, {
    icon: "shopping_cart",
    label: "\u0639\u0631\u0628\u0629 \u0627\u0644\u062A\u0633\u0648\u0642",
    badge: cartCount,
    onClick: onCart
  }), /*#__PURE__*/React.createElement(HeaderIcon, {
    icon: "account_circle",
    label: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u062F\u064A\u0631"
  })));
}
function HeaderIcon({
  icon,
  label,
  badge,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    "aria-label": label,
    title: label,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      cursor: 'pointer',
      color: '#fff',
      background: hover ? 'var(--white-10)' : 'transparent',
      transition: 'background var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '24px'
    }
  }, icon), badge > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '-2px',
      insetInlineEnd: '-2px',
      background: 'var(--danger-500)',
      color: '#fff',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--fw-bold)',
      borderRadius: 'var(--radius-pill)',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, badge) : null);
}
Object.assign(__ds_scope, { StoreHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StoreHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/AdminShell.jsx
try { (() => {
const {
  Button,
  Badge
} = window.BaytAlEzzDesignSystem_ca378b;

/* Shared admin chrome: page heading, the sticky form column, and the bordered
   table panel with its grey header strip — the shape both CRUD pages use
   (src/js/admin/sections-crud.js, products-crud.js). */
function AdminPageHeading({
  title,
  subtitle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-2xl)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, subtitle));
}
function AdminField({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-heading)',
      marginBottom: '6px'
    }
  }, label), children);
}
const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-input)',
  padding: '10px 16px',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-core)',
  color: 'var(--text-heading)',
  background: 'var(--surface-card)',
  outline: 'none'
};
function AdminTablePanel({
  title,
  count,
  columns,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'var(--gray-50)',
      borderBottom: '1px solid var(--border-hairline-soft)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)',
      fontSize: 'var(--text-sm)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)'
    }
  }, count)), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      textAlign: 'right',
      fontSize: 'var(--text-sm)',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", {
    style: {
      background: 'var(--gray-50)',
      color: 'var(--text-body)',
      fontWeight: 'var(--fw-bold)'
    }
  }, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      padding: '16px',
      textAlign: c.center ? 'center' : 'right',
      borderBottom: '1px solid var(--border-hairline)',
      fontWeight: 'inherit'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", {
    style: {
      color: 'var(--text-heading)'
    }
  }, children)));
}
function RowActions({
  onEdit,
  onDelete
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement(RowIcon, {
    icon: "edit",
    title: "\u062A\u0639\u062F\u064A\u0644",
    color: "var(--primary-blue)",
    hoverBg: "var(--primary-blue-10)",
    onClick: onEdit
  }), /*#__PURE__*/React.createElement(RowIcon, {
    icon: "delete",
    title: "\u062D\u0630\u0641",
    color: "var(--danger-500)",
    hoverBg: "var(--danger-50)",
    onClick: onDelete
  }));
}
function RowIcon({
  icon,
  title,
  color,
  hoverBg,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    title: title,
    "aria-label": title,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: '32px',
      height: '32px',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color,
      background: hover ? hoverBg : 'transparent',
      transition: 'background var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '18px'
    }
  }, icon));
}
const trStyle = {
  borderBottom: '1px solid var(--border-hairline-soft)'
};
Object.assign(window, {
  AdminPageHeading,
  AdminField,
  AdminTablePanel,
  RowActions,
  fieldStyle,
  trStyle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/AdminShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/DashboardScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  StatCard,
  Card,
  CardTitle,
  Button
} = window.BaytAlEzzDesignSystem_ca378b;

/* Recreation of src/pages/admin/dashboard.html: two stat tiles, a quick-actions panel
   of three rows, then the amber wholesale-link card (the only amber surface in the admin). */
function DashboardScreen({
  onNavigate
}) {
  const [copied, setCopied] = React.useState(false);
  const actions = [{
    id: 'sections',
    icon: 'layers',
    label: 'إدارة أقسام البيت'
  }, {
    id: 'products',
    icon: 'inventory_2',
    label: 'إدارة المنتجات'
  }, {
    id: 'invoices',
    icon: 'receipt_long',
    label: 'إنشاء وطباعة فاتورة'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-4xl)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--fw-extrabold)',
      color: 'var(--text-heading)'
    }
  }, "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0628\u064A\u062A \u0627\u0644\u0639\u0632"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      color: 'var(--text-body)'
    }
  }, "\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 \u062A\u0627\u062C\u0631\u0646\u0627. \u0645\u0646 \u0647\u0646\u0627 \u064A\u0645\u0643\u0646\u0643 \u0625\u062F\u0627\u0631\u0629 \u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0628\u064A\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0628\u0643\u0644 \u0633\u0647\u0648\u0644\u0629.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    icon: "layers",
    label: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u0642\u0633\u0627\u0645",
    value: "\u0661\u0662",
    tone: "brand"
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "inventory_2",
    label: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A",
    value: "\u0661\u0662",
    tone: "navy"
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardTitle, null, "\u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0644\u0644\u0639\u0645\u0644\u064A\u0627\u062A"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: '16px'
    }
  }, actions.map(a => /*#__PURE__*/React.createElement(QuickAction, _extends({
    key: a.id
  }, a, {
    onClick: () => onNavigate(a.id)
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--wholesale-50)',
      border: '1px solid var(--wholesale-200)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      marginTop: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'var(--wholesale-800)',
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--text-base)',
      marginBottom: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined"
  }, "sell"), /*#__PURE__*/React.createElement("span", null, "\u0631\u0627\u0628\u0637 \u062A\u0633\u0639\u064A\u0631 \u0627\u0644\u062C\u0645\u0644\u0629 \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u0645\u064A\u0632\u064A\u0646")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      color: 'var(--wholesale-700)',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, "\u0627\u0646\u0633\u062E \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0648\u0623\u0631\u0633\u0644\u0647 \u0644\u062A\u062C\u0627\u0631 \u0627\u0644\u062C\u0645\u0644\u0629 \u0644\u064A\u062A\u0645\u0643\u0646\u0648\u0627 \u0645\u0646 \u0639\u0631\u0636 \u0648\u062A\u0635\u0641\u062D \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0628\u062A\u0633\u0639\u064A\u0631\u0629 \u0627\u0644\u062C\u0645\u0644\u0629 \u0641\u0642\u0637 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0645\u0646 \u0642\u0628\u0644\u0643.")), /*#__PURE__*/React.createElement(Button, {
    variant: copied ? 'success' : 'wholesale',
    icon: copied ? 'done' : 'content_copy',
    size: "sm",
    onClick: () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    },
    style: {
      flexShrink: 0
    }
  }, copied ? 'تم النسخ ✓' : 'نسخ رابط الجملة')));
}
function QuickAction({
  icon,
  label,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      background: hover ? 'var(--primary-blue-05)' : 'var(--gray-50)',
      border: '1px solid ' + (hover ? 'var(--primary-blue)' : 'var(--gray-200)'),
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontFamily: 'var(--font-core)',
      textAlign: 'start',
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      color: hover ? 'var(--primary-blue)' : 'var(--neutral-gray)'
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-heading)'
    }
  }, label)), /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '14px',
      color: 'var(--neutral-gray)',
      transform: hover ? 'translateX(-4px)' : 'none',
      transition: 'transform var(--dur-fast) var(--ease-standard)'
    }
  }, "arrow_back"));
}
Object.assign(window, {
  DashboardScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/LoginScreen.jsx
try { (() => {
const {
  Input,
  Button,
  Card
} = window.BaytAlEzzDesignSystem_ca378b;

/* Recreation of src/pages/admin/login.html: a single 24px-radius card centred on the
   page background. Five failed attempts lock the form for 60s (message shown in red). */
function LoginScreen({
  onLogin
}) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: '448px',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-xl)',
      padding: '32px',
      boxShadow: 'var(--shadow-lg)',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--fw-extrabold)',
      color: 'var(--text-heading)'
    }
  }, "\u062F\u062E\u0648\u0644 \u0627\u0644\u062A\u0627\u062C\u0631"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0645\u062C\u062F\u062F\u0627\u064B \u0641\u064A \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0645\u062A\u062C\u0631 \u0628\u064A\u062A \u0627\u0644\u0639\u0632.")), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      if (!email || !password) {
        setError('بيانات الدخول غير صحيحة.');
        return;
      }
      onLogin();
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    type: "email",
    placeholder: "name@domain.com",
    value: email,
    onChange: e => {
      setEmail(e.target.value);
      setError('');
    }
  }), /*#__PURE__*/React.createElement(Input, {
    label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    value: password,
    onChange: e => {
      setPassword(e.target.value);
      setError('');
    },
    error: error || undefined
  }), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    size: "lg",
    icon: "login",
    style: {
      marginTop: '8px'
    }
  }, "\u062F\u062E\u0648\u0644")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '32px',
      textAlign: 'center',
      fontSize: 'var(--text-xs)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "../storefront/index.html",
    style: {
      color: 'var(--text-body)'
    }
  }, "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u062A\u062C\u0631 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629"))));
}
Object.assign(window, {
  LoginScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/ProductsScreen.jsx
try { (() => {
const {
  Button
} = window.BaytAlEzzDesignSystem_ca378b;

/* Recreation of src/pages/admin/products.html + the renderProductRow template in
   src/js/admin/admin-templates.js: thumbnail, name + clamped description, section
   chip, retail price with an amber "جملة:" sub-chip, then edit/delete row actions.
   The form column is abbreviated to the fields visible in the templates + schema. */
function ProductsScreen() {
  const {
    AdminPageHeading,
    AdminField,
    AdminTablePanel,
    RowActions,
    fieldStyle,
    trStyle
  } = window;
  const [section, setSection] = React.useState('laundry');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-4xl)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(AdminPageHeading, {
    title: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A",
    subtitle: "\u0625\u0636\u0627\u0641\u0629 \u0648\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0642\u0637\u0627\u0639\u064A \u0648\u0627\u0644\u062C\u0645\u0644\u0629."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '32px',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => e.preventDefault(),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      paddingBottom: '8px',
      borderBottom: '1px solid var(--border-hairline-soft)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062A\u062C \u062C\u062F\u064A\u062F"), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldStyle,
    placeholder: "\u0645\u062B\u0627\u0644: \u0645\u0633\u062D\u0648\u0642 \u063A\u0633\u064A\u0644 \u0623\u0648\u062A\u0648\u0645\u0627\u062A\u064A\u0643"
  })), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0627\u0644\u0648\u0635\u0641"
  }, /*#__PURE__*/React.createElement("textarea", {
    style: {
      ...fieldStyle,
      height: '72px',
      resize: 'none'
    },
    placeholder: "\u0648\u0635\u0641 \u0642\u0635\u064A\u0631 \u064A\u0638\u0647\u0631 \u0641\u064A \u0643\u0627\u0631\u062A \u0627\u0644\u0645\u0646\u062A\u062C."
  })), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0627\u0644\u0642\u0633\u0645"
  }, /*#__PURE__*/React.createElement("select", {
    style: fieldStyle,
    value: section,
    onChange: e => setSection(e.target.value)
  }, window.SECTIONS.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.slug,
    value: s.slug
  }, s.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0633\u0639\u0631 \u0627\u0644\u0642\u0637\u0627\u0639\u064A"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldStyle,
    placeholder: "\u0661\u0668\u0665",
    inputMode: "numeric"
  })), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0633\u0639\u0631 \u0627\u0644\u062C\u0645\u0644\u0629"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldStyle,
    placeholder: "\u0661\u0665\u0668",
    inputMode: "numeric"
  }))), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0627\u0644\u0645\u0642\u0627\u0633\u0627\u062A (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0627\u0635\u0644\u0629)"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldStyle,
    placeholder: "\u0635\u063A\u064A\u0631\u060C \u0648\u0633\u0637\u060C \u0643\u0628\u064A\u0631"
  })), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0627\u0644\u0623\u0644\u0648\u0627\u0646 (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0627\u0635\u0644\u0629)"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldStyle,
    placeholder: "\u0623\u0628\u064A\u0636\u060C \u0623\u0633\u0648\u062F"
  })), /*#__PURE__*/React.createElement(Button, {
    icon: "save",
    size: "sm",
    fullWidth: true,
    style: {
      marginTop: '8px'
    }
  }, "\u062D\u0641\u0638 \u0627\u0644\u0645\u0646\u062A\u062C")), /*#__PURE__*/React.createElement(AdminTablePanel, {
    title: "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629",
    count: "\u0661\u0662 \u0645\u0646\u062A\u062C",
    columns: [{
      label: 'الصورة'
    }, {
      label: 'المنتج'
    }, {
      label: 'القسم'
    }, {
      label: 'السعر'
    }, {
      label: 'الإجراءات',
      center: true
    }]
  }, window.PRODUCTS.slice(0, 5).map(p => {
    const sec = window.SECTIONS.find(s => s.slug === p.section);
    return /*#__PURE__*/React.createElement("tr", {
      key: p.id,
      style: trStyle
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-hairline-soft)',
        overflow: 'hidden',
        background: 'var(--gray-100)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.image,
      alt: p.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        padding: '4px',
        boxSizing: 'border-box'
      }
    }))), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '16px',
        fontWeight: 'var(--fw-bold)'
      }
    }, /*#__PURE__*/React.createElement("div", null, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-xs)',
        color: 'var(--text-body)',
        marginTop: '2px',
        fontWeight: 'var(--fw-regular)',
        maxWidth: '260px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, p.description)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '16px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: 'var(--gray-100)',
        color: 'var(--gray-600)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--fw-semibold)',
        padding: '2px 10px',
        borderRadius: 'var(--radius-pill)'
      }
    }, sec ? sec.name : 'غير محدد')), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 'var(--fw-bold)',
        color: 'var(--primary-blue)'
      }
    }, window.money(p.price)), p.wholesale ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--text-xs)',
        color: 'var(--wholesale-700)',
        fontWeight: 'var(--fw-bold)',
        background: 'var(--wholesale-50)',
        padding: '2px 8px',
        borderRadius: '4px',
        border: '1px solid var(--wholesale-200)',
        width: 'fit-content',
        marginTop: '4px'
      }
    }, "\u062C\u0645\u0644\u0629: ", window.money(p.wholesale)) : null), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '16px'
      }
    }, /*#__PURE__*/React.createElement(RowActions, null)));
  }), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "5",
    style: {
      padding: '12px 16px',
      fontSize: 'var(--text-xs)',
      color: 'var(--gray-400)',
      textAlign: 'center'
    }
  }, "\u2026 \u0667 \u0645\u0646\u062A\u062C\u0627\u062A \u0623\u062E\u0631\u0649")))));
}
Object.assign(window, {
  ProductsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/ProductsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/SectionsScreen.jsx
try { (() => {
const {
  Button
} = window.BaytAlEzzDesignSystem_ca378b;

/* Recreation of src/pages/admin/sections.html + sections-crud.js: a sticky
   add/edit form on one third, the sections table on two thirds. The icon picker
   is a 4-column grid; the gift icon gets the amber "مميز" treatment because it
   places the section in the roof triangle instead of the room grid. */
const ICON_FILES = ['laundry.svg', 'kitchen-shelving.svg', 'paper-goods.svg', 'bathroom.svg', 'women.svg', 'men.svg', 'reception.svg', 'baby.svg', 'footwear.svg', 'vanity.svg', 'garage.svg', 'cleaning.svg'];
function SectionsScreen() {
  const {
    AdminPageHeading,
    AdminField,
    AdminTablePanel,
    RowActions,
    fieldStyle,
    trStyle
  } = window;
  const [icon, setIcon] = React.useState('laundry.svg');
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('المجموعات المختارة بعناية لأثاثك المنزلي.');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-4xl)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(AdminPageHeading, {
    title: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0642\u0633\u0627\u0645 (\u0627\u0644\u0631\u0648\u0645\u0627\u062A)",
    subtitle: "\u0625\u0636\u0627\u0641\u0629 \u0648\u062A\u0639\u062F\u064A\u0644 \u0648\u062D\u0630\u0641 \u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0645\u062A\u062C\u0631 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A\u0629."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '32px',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => e.preventDefault(),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      paddingBottom: '8px',
      borderBottom: '1px solid var(--border-hairline-soft)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, "\u0625\u0636\u0627\u0641\u0629 \u0642\u0633\u0645 \u062C\u062F\u064A\u062F"), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0627\u0633\u0645 \u0627\u0644\u0642\u0633\u0645 (\u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629)"
  }, /*#__PURE__*/React.createElement("input", {
    style: fieldStyle,
    placeholder: "\u0645\u062B\u0627\u0644: \u0631\u0641\u0627\u064A\u0639 \u0627\u0644\u0645\u0637\u0628\u062E",
    value: name,
    onChange: e => setName(e.target.value)
  })), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0627\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u064A\u0629 \u0644\u0644\u0642\u0633\u0645 (\u0627\u0644\u0648\u0635\u0641)"
  }, /*#__PURE__*/React.createElement("textarea", {
    style: {
      ...fieldStyle,
      height: '80px',
      resize: 'none'
    },
    value: desc,
    onChange: e => setDesc(e.target.value)
  })), /*#__PURE__*/React.createElement(AdminField, {
    label: "\u0627\u0644\u0623\u064A\u0642\u0648\u0646\u0629 (\u0627\u062E\u062A\u0631 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: '8px'
    }
  }, ICON_FILES.map(f => {
    const on = f === icon;
    return /*#__PURE__*/React.createElement("button", {
      key: f,
      type: "button",
      title: f,
      onClick: () => setIcon(f),
      style: {
        padding: '8px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: on ? 'var(--primary-blue-10)' : 'var(--surface-card)',
        border: '1px solid ' + (on ? 'var(--primary-blue)' : 'var(--gray-200)'),
        boxShadow: on ? '0 0 0 1px var(--primary-blue)' : 'none',
        transition: 'all var(--dur-fast) var(--ease-standard)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: '../../assets/icons/' + f,
      alt: "",
      style: {
        width: '40px',
        height: '40px',
        objectFit: 'contain',
        pointerEvents: 'none'
      }
    }));
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: "\u0645\u0648\u0636\u0639 \u062E\u0627\u0635: \u0642\u0633\u0645 \u0639\u0631\u0648\u0636 \u0627\u0644\u0628\u064A\u062A (\u0627\u0644\u0645\u062B\u0644\u062B \u0627\u0644\u0639\u0644\u0648\u064A)",
    onClick: () => setIcon('Gift_Home.svg'),
    style: {
      position: 'relative',
      padding: '8px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: icon === 'Gift_Home.svg' ? 'rgba(30,33,84,.1)' : 'var(--surface-card)',
      border: '2px solid ' + (icon === 'Gift_Home.svg' ? 'var(--gift-navy)' : 'var(--wholesale-500)'),
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '-7px',
      insetInlineEnd: '4px',
      fontSize: '8px',
      fontWeight: 'var(--fw-bold)',
      background: 'var(--wholesale-500)',
      color: '#fff',
      padding: '0 4px',
      borderRadius: '3px',
      lineHeight: 1.4
    }
  }, "\u0645\u0645\u064A\u0632"), /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-outlined",
    style: {
      fontSize: '36px',
      color: 'var(--gift-navy)'
    }
  }, "redeem"))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: '10px',
      color: 'var(--wholesale-600)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px'
    }
  }, "\u26A0\uFE0F"), "\u0627\u062E\u062A\u064A\u0627\u0631 \u0623\u064A\u0642\u0648\u0646\u0629 \u0627\u0644\u0647\u062F\u064A\u0629 \u064A\u0636\u0639 \u0627\u0644\u0642\u0633\u0645 \u0641\u064A \u0645\u0648\u0642\u0639 \u062E\u0627\u0635 \u062F\u0627\u062E\u0644 \u0645\u062B\u0644\u062B \u0627\u0644\u0628\u064A\u062A (\u0627\u0644\u0623\u0639\u0644\u0649).")), /*#__PURE__*/React.createElement(Button, {
    icon: "save",
    size: "sm",
    fullWidth: true,
    style: {
      marginTop: '8px'
    }
  }, "\u062D\u0641\u0638 \u0627\u0644\u0642\u0633\u0645")), /*#__PURE__*/React.createElement(AdminTablePanel, {
    title: "\u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u062D\u0627\u0644\u064A\u0629",
    count: "\u0661\u0662 \u0642\u0633\u0645 \u0646\u0634\u0637",
    columns: [{
      label: 'الترتيب'
    }, {
      label: 'اسم القسم'
    }, {
      label: 'الأيقونة'
    }, {
      label: 'الإجراءات',
      center: true
    }]
  }, window.SECTIONS.slice(0, 5).map((s, i) => /*#__PURE__*/React.createElement("tr", {
    key: s.slug,
    style: trStyle
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '16px',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--gray-400)'
    }
  }, "#", i + 1), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '16px',
      fontWeight: 'var(--fw-bold)'
    }
  }, /*#__PURE__*/React.createElement("div", null, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)',
      marginTop: '2px',
      fontWeight: 'var(--fw-regular)',
      maxWidth: '200px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u0628\u0639\u0646\u0627\u064A\u0629 \u0644\u0623\u062B\u0627\u062B\u0643 \u0627\u0644\u0645\u0646\u0632\u0644\u064A.")), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: '../../assets/icons/' + s.icon,
    alt: "",
    style: {
      width: '56px',
      height: '56px',
      objectFit: 'contain'
    }
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement(RowActions, null)))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "4",
    style: {
      padding: '12px 16px',
      fontSize: 'var(--text-xs)',
      color: 'var(--gray-400)',
      textAlign: 'center'
    }
  }, "\u2026 \u0667 \u0623\u0642\u0633\u0627\u0645 \u0623\u062E\u0631\u0649")))));
}
Object.assign(window, {
  SectionsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/SectionsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/app.jsx
try { (() => {
const {
  AdminSidebar,
  EmptyState
} = window.BaytAlEzzDesignSystem_ca378b;
const NAV = [{
  id: 'dashboard',
  label: 'الرئيسية',
  icon: 'dashboard'
}, {
  id: 'sections',
  label: 'إدارة الأقسام',
  icon: 'layers'
}, {
  id: 'products',
  label: 'إدارة المنتجات',
  icon: 'inventory_2'
}, {
  id: 'invoices',
  label: 'إنشاء وطباعة فاتورة',
  icon: 'receipt_long'
}, {
  id: 'customers',
  label: 'إدارة العملاء',
  icon: 'group'
}];
function AdminApp() {
  const [signedIn, setSignedIn] = React.useState(false);
  const [page, setPage] = React.useState('dashboard');
  if (!signedIn) return /*#__PURE__*/React.createElement(window.LoginScreen, {
    onLogin: () => setSignedIn(true)
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement(AdminSidebar, {
    items: NAV,
    active: page,
    onSelect: i => setPage(i.id),
    onLogout: () => setSignedIn(false),
    style: {
      position: 'sticky',
      top: 0,
      height: '100vh',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flexGrow: 1,
      padding: '48px',
      minWidth: 0
    }
  }, page === 'dashboard' ? /*#__PURE__*/React.createElement(window.DashboardScreen, {
    onNavigate: setPage
  }) : null, page === 'sections' ? /*#__PURE__*/React.createElement(window.SectionsScreen, null) : null, page === 'products' ? /*#__PURE__*/React.createElement(window.ProductsScreen, null) : null, page === 'invoices' || page === 'customers' ? /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-4xl)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: "construction",
    title: page === 'invoices' ? 'شاشة الفواتير غير مُعاد بناؤها' : 'شاشة العملاء غير مُعاد بناؤها',
    description: "\u0647\u0630\u0647 \u0627\u0644\u0634\u0627\u0634\u0629 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639 (invoices.html / customers.html) \u0644\u0643\u0646\u0647\u0627 \u0644\u0645 \u062A\u064F\u062F\u0631\u062C \u0641\u064A \u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0648\u0627\u062C\u0647\u0627\u062A \u0628\u0639\u062F \u2014 \u0623\u0636\u0641\u0647\u0627 \u0625\u0630\u0627 \u0627\u062D\u062A\u062C\u062A\u0647\u0627."
  })) : null));
}
Object.assign(window, {
  AdminApp
});
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(AdminApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/CartScreen.jsx
try { (() => {
const {
  CartLine,
  OrderSummary,
  EmptyState,
  Modal
} = window.BaytAlEzzDesignSystem_ca378b;

/* Recreation of src/pages/cart.html: lines on the inline-start column, a sticky
   380px order-summary panel on the other, and the post-order thank-you modal.
   There is no checkout — the order leaves as a formatted WhatsApp message. */
function CartScreen({
  items,
  onQuantity,
  onRemove,
  onBrowse,
  wholesale
}) {
  const [thanks, setThanks] = React.useState(false);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return /*#__PURE__*/React.createElement("main", {
    style: {
      flexGrow: 1,
      maxWidth: 'var(--container-6xl)',
      width: '100%',
      margin: '0 auto',
      padding: '32px',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 8px',
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--fw-extrabold)',
      color: 'var(--text-heading)'
    }
  }, "\u0639\u0631\u0628\u0629 \u0627\u0644\u062A\u0633\u0648\u0642"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--text-body)'
    }
  }, "\u0631\u0627\u062C\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062A\u064A \u0627\u062E\u062A\u0631\u062A\u0647\u0627 \u0642\u0628\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '32px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      minWidth: 0
    }
  }, items.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "shopping_cart_off",
    title: "\u0627\u0644\u0633\u0644\u0629 \u0641\u0627\u0631\u063A\u0629",
    description: "\u062A\u0635\u0641\u062D \u0623\u0642\u0633\u0627\u0645 \u0628\u064A\u062A \u0627\u0644\u0639\u0632 \u0648\u0623\u0636\u0641 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629.",
    actionLabel: "\u062A\u0635\u0641\u062D \u0627\u0644\u0645\u062A\u062C\u0631",
    actionIcon: "home",
    onAction: onBrowse
  }) : items.map(i => /*#__PURE__*/React.createElement(CartLine, {
    key: i.key,
    name: i.name,
    details: i.details,
    image: i.image,
    price: i.price,
    quantity: i.quantity,
    stale: i.stale,
    onQuantity: n => onQuantity(i.key, n),
    onRemove: () => onRemove(i.key)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 'var(--summary-width)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(OrderSummary, {
    subtotal: subtotal,
    disabled: items.length === 0,
    onSend: () => setThanks(true),
    onCopy: () => setThanks(true)
  }), wholesale ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '12px 4px 0',
      fontSize: 'var(--text-xs)',
      color: 'var(--wholesale-800)'
    }
  }, "\uD83C\uDFF7\uFE0F \u0627\u0644\u0637\u0644\u0628 \u0633\u064A\u064F\u0631\u0633\u0644 \u0643\u0640 \xAB\u0637\u0644\u0628 \u062C\u0645\u0644\u0629\xBB \u0628\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629.") : null)), /*#__PURE__*/React.createElement(Modal, {
    open: thanks,
    title: "\u0634\u0643\u0631\u0627\u064B \u0644\u0643 \u0639\u0644\u0649 \u0637\u0644\u0628\u0643\u0645 \u0645\u0646 \u0645\u062A\u062C\u0631 \u0628\u064A\u062A \u0627\u0644\u0639\u0632",
    description: "\u0632\u0631\u0646\u0627 \u0643\u0644 \u0623\u0633\u0628\u0648\u0639 \u062D\u062A\u0649 \u0644\u0627 \u064A\u0641\u0648\u062A\u0643 \u0643\u0644 \u062C\u062F\u064A\u062F \u0645\u0646 \u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A.",
    onClose: () => setThanks(false),
    style: {
      position: 'fixed'
    }
  }));
}
Object.assign(window, {
  CartScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/CartScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/CategoryScreen.jsx
try { (() => {
const {
  Breadcrumbs,
  SectionNav,
  ProductCard,
  EmptyState,
  SkeletonProductCard
} = window.BaytAlEzzDesignSystem_ca378b;

/* Recreation of src/pages/category.html: sticky sidebar of rooms + breadcrumbs,
   section title/description, then a 3-up product grid. In wholesale mode products
   without a wholesale price are filtered out entirely (filterWholesaleProducts). */
function CategoryScreen({
  slug,
  searchQuery,
  wholesale,
  onSelectSection,
  onOpenProduct,
  onAdd,
  loading
}) {
  const section = window.SECTIONS.find(s => s.slug === slug);
  let products = searchQuery ? window.PRODUCTS.filter(p => p.name.includes(searchQuery) || p.description.includes(searchQuery)) : window.PRODUCTS.filter(p => p.section === slug);
  if (wholesale) products = products.filter(p => p.wholesale > 0);
  const title = searchQuery ? `نتائج البحث عن "${searchQuery}"` : section ? section.name : '';
  const desc = searchQuery ? `عثرنا على ${products.length} منتج يطابق بحثك.` : 'المجموعات المختارة بعناية لأثاثك المنزلي.';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flexGrow: 1,
      display: 'flex',
      maxWidth: 'var(--container-7xl)',
      width: '100%',
      margin: '0 auto',
      padding: '32px',
      gap: '32px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--sidebar-width)',
      flexShrink: 0,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      height: 'fit-content',
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 16px',
      paddingBottom: '8px',
      borderBottom: '1px solid var(--border-hairline-soft)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text-heading)'
    }
  }, "\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0628\u064A\u062A"), /*#__PURE__*/React.createElement(SectionNav, {
    sections: window.SECTIONS,
    active: slug,
    onSelect: onSelectSection,
    iconBase: "../../assets/icons/"
  })), /*#__PURE__*/React.createElement("main", {
    style: {
      flexGrow: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    items: [{
      label: 'الرئيسية'
    }, {
      label: searchQuery ? `البحث: ${searchQuery}` : title
    }],
    style: {
      marginBottom: '16px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--fw-extrabold)',
      color: 'var(--text-heading)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      color: 'var(--text-body)'
    }
  }, desc)), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--grid-gap)'
    }
  }, /*#__PURE__*/React.createElement(SkeletonProductCard, null), /*#__PURE__*/React.createElement(SkeletonProductCard, null), /*#__PURE__*/React.createElement(SkeletonProductCard, null)) : products.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: searchQuery ? 'search_off' : 'folder_open',
    title: searchQuery ? 'لا توجد نتائج بحث مطابقة' : 'لا توجد منتجات متاحة',
    description: searchQuery ? `لم نعثر على أي منتج يطابق كلمة "${searchQuery}". جرب البحث باسم منتج آخر.` : wholesale ? 'لا توجد منتجات مسعرة بالجملة في هذا القسم حالياً.' : 'لم يتم إضافة منتجات في هذا القسم بعد.',
    actionLabel: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0628\u064A\u062A",
    actionIcon: "home",
    onAction: () => onSelectSection(null)
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--grid-gap)'
    }
  }, products.map(p => {
    const prices = (p.variants || []).map(v => v.price);
    const differing = new Set(prices).size > 1;
    return /*#__PURE__*/React.createElement(ProductCard, {
      key: p.id,
      name: p.name,
      description: p.description,
      image: p.image,
      price: wholesale ? p.wholesale : Math.min(...prices, p.price),
      wholesale: wholesale,
      startingFrom: !wholesale && differing,
      inStock: (p.variants || []).some(v => v.inStock !== false),
      onAdd: () => onAdd(p),
      onOpen: () => onOpenProduct(p),
      href: "#"
    });
  }))));
}
Object.assign(window, {
  CategoryScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/CategoryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/HomeScreen.jsx
try { (() => {
const {
  HouseHero,
  StoreFooter
} = window.BaytAlEzzDesignSystem_ca378b;

/* Recreation of src/pages/index.html: hero copy over the interactive floorplan,
   on a 3%-opacity 40px grid. Wholesale mode swaps the three hero strings
   (see src/js/pricing-mode.js → updateWholesaleHeroText). */
function HomeScreen({
  wholesale,
  onSelectSection
}) {
  const copy = wholesale ? {
    title: 'مرحباً بك في بيت العز 🏷️',
    d1: 'زوارنا الكرام ، نضع بين أيديكم أجود مستلزمات البيت بأفضل أسعار الجملة 💼✨',
    d2: 'تصفحوا الغرف وأقسام المتجر واستمتعوا بتجربة تسوق سريعة، ومريحة 🚀📦'
  } : {
    title: 'مرحباً بك في بيت العز',
    d1: 'نسعى أن نقدم لكم منتجات جيدة يحتاجها البيت بأسعار تحافظ على ميزانية الأسرة وتلقى قبولكم 😊',
    d2: 'استمتع بجولة في الغرف وأقسام البيت واختر ما يناسبك وسنعمل على توصيل الطلبات لكم سريعا 🛒'
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity: .03,
      backgroundImage: 'linear-gradient(to right,currentColor 1px,transparent 1px),linear-gradient(to bottom,currentColor 1px,transparent 1px)',
      backgroundSize: '40px 40px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '896px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 16px',
      fontSize: 'var(--text-5xl)',
      lineHeight: 1.15,
      fontWeight: 'var(--fw-extrabold)',
      color: 'var(--primary-blue)'
    }
  }, copy.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 auto',
      maxWidth: '672px',
      fontSize: 'var(--text-xl)',
      lineHeight: 'var(--leading-relaxed)',
      color: 'var(--text-body)'
    }
  }, copy.d1), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px auto 0',
      maxWidth: '672px',
      fontSize: 'var(--text-xl)',
      lineHeight: 'var(--leading-relaxed)',
      color: 'var(--text-body)'
    }
  }, copy.d2)), /*#__PURE__*/React.createElement(HouseHero, {
    sections: window.SECTIONS,
    giftSection: {
      name: 'عروض البيت'
    },
    onSelect: onSelectSection,
    openDelay: 1200,
    frameClosed: "../../assets/Frame 1.svg",
    frameOpen: "../../assets/Frame 2.svg",
    iconBase: "../../assets/icons/"
  })));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/ProductScreen.jsx
try { (() => {
const {
  Breadcrumbs,
  SwatchGroup,
  PriceTag,
  Button,
  Badge
} = window.BaytAlEzzDesignSystem_ca378b;

/* Recreation of src/pages/product.html: one 24px-radius card, square image well on
   one side, section pill + title + description + swatch groups on the other, price
   and add-to-cart separated by a hairline at the bottom. */
function ProductScreen({
  product,
  wholesale,
  onSelectSection,
  onAdd,
  onBack
}) {
  const section = window.SECTIONS.find(s => s.slug === product.section);
  const [variant, setVariant] = React.useState((product.variants || [])[0]?.value);
  const [size, setSize] = React.useState((product.sizes || [])[0]);
  const [added, setAdded] = React.useState(false);
  const active = (product.variants || []).find(v => v.value === variant) || {};
  const inStock = active.inStock !== false;
  const price = wholesale ? product.wholesale : active.price ?? product.price;
  if (wholesale && !product.wholesale) {
    const {
      EmptyState
    } = window.BaytAlEzzDesignSystem_ca378b;
    return /*#__PURE__*/React.createElement("main", {
      style: {
        flexGrow: 1,
        maxWidth: 'var(--container-5xl)',
        width: '100%',
        margin: '0 auto',
        padding: '32px',
        boxSizing: 'border-box'
      }
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: "sell",
      tone: "wholesale",
      title: "\u0639\u0641\u0648\u0627\u064B\u060C \u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0644\u0644\u0628\u064A\u0639 \u0628\u0627\u0644\u062C\u0645\u0644\u0629",
      description: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u062D\u062F\u064A\u062F \u0633\u0639\u0631 \u062C\u0645\u0644\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u062D\u0627\u0644\u064A\u0627\u064B. \u064A\u0631\u062C\u0649 \u062A\u0635\u0641\u062D \u0628\u0627\u0642\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0633\u0639\u0631\u0629 \u0628\u0627\u0644\u062C\u0645\u0644\u0629.",
      actionLabel: "\u062A\u0635\u0641\u062D \u0645\u062A\u062C\u0631 \u0627\u0644\u062C\u0645\u0644\u0629",
      actionIcon: "home",
      onAction: onBack,
      style: {
        borderRadius: 'var(--radius-xl)'
      }
    }));
  }
  return /*#__PURE__*/React.createElement("main", {
    style: {
      flexGrow: 1,
      maxWidth: 'var(--container-5xl)',
      width: '100%',
      margin: '0 auto',
      padding: '32px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    items: [{
      label: 'الرئيسية'
    }, {
      label: section ? section.name : 'القسم'
    }, {
      label: product.name
    }],
    onNavigate: c => {
      if (section && c.label === section.name) onSelectSection(section);else onBack();
    },
    style: {
      marginBottom: '24px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-xl)',
      padding: '32px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      gap: '32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '50%',
      aspectRatio: '1 / 1',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-hairline-soft)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: product.image,
    alt: product.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      padding: '14%',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '50%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand",
    style: {
      marginBottom: '12px'
    }
  }, section ? section.name : ''), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 12px',
      fontSize: 'var(--text-3xl)',
      fontWeight: 'var(--fw-extrabold)',
      color: 'var(--text-heading)'
    }
  }, product.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 24px',
      color: 'var(--text-body)',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, product.description), (product.variants || []).length > 1 ? /*#__PURE__*/React.createElement(SwatchGroup, {
    label: "\u0627\u0644\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0645\u062A\u0627\u062D\u0629:",
    value: variant,
    onChange: setVariant,
    options: product.variants
  }) : null, (product.sizes || []).length ? /*#__PURE__*/React.createElement(SwatchGroup, {
    label: "\u0627\u0644\u0645\u0642\u0627\u0633 \u0627\u0644\u0645\u062A\u0627\u062D:",
    value: size,
    onChange: setSize,
    options: product.sizes
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: '24px',
      borderTop: '1px solid var(--border-hairline-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(PriceTag, {
    value: price,
    wholesale: wholesale,
    size: "xl",
    label: wholesale ? 'سعر الجملة' : 'السعر'
  }), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    disabled: !inStock,
    variant: added ? 'success' : 'primary',
    icon: added ? 'done' : inStock ? 'shopping_cart' : 'info',
    onClick: () => {
      if (!inStock) return;
      setAdded(true);
      onAdd(product, active, size);
      setTimeout(() => setAdded(false), 1500);
    }
  }, added ? 'تمت الإضافة ✓' : inStock ? 'أضف للسلة' : 'غير متوفر')))));
}
Object.assign(window, {
  ProductScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/ProductScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/app.jsx
try { (() => {
const {
  StoreHeader,
  SearchBar,
  StoreFooter
} = window.BaytAlEzzDesignSystem_ca378b;
function StorefrontApp() {
  const [screen, setScreen] = React.useState('home');
  const [slug, setSlug] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState(null);
  const [product, setProduct] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [cart, setCart] = React.useState([]);
  const [wholesale, setWholesale] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const go = (next, fn) => {
    setLoading(true);
    if (fn) fn();
    setScreen(next);
    setTimeout(() => setLoading(false), 450);
  };
  const openSection = s => {
    if (!s) {
      setScreen('home');
      return;
    }
    go('category', () => {
      setSlug(s.slug);
      setSearchQuery(null);
    });
  };
  const openProduct = p => go('product', () => setProduct(p));
  const add = (p, variant, size) => {
    const v = variant || (p.variants || [])[0] || {};
    const key = p.id + '|' + (v.value || '') + '|' + (size || '');
    const price = wholesale ? p.wholesale : v.price ?? p.price;
    const details = [v.value, size ? 'المقاس: ' + size : null].filter(Boolean).join(' | ');
    setCart(c => {
      const found = c.find(i => i.key === key);
      if (found) return c.map(i => i.key === key ? {
        ...i,
        quantity: i.quantity + 1
      } : i);
      return [...c, {
        key,
        name: p.name,
        details,
        image: p.image,
        price,
        quantity: 1
      }];
    });
  };
  const results = query.trim() ? window.PRODUCTS.filter(p => p.name.includes(query.trim())).map(p => {
    const sec = window.SECTIONS.find(s => s.slug === p.section);
    return {
      id: p.id,
      name: p.name,
      image: p.image,
      section: sec && sec.name,
      price: wholesale ? p.wholesale : p.price
    };
  }) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '8px 16px',
      background: '#fff',
      borderBottom: '1px solid var(--border-hairline)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u0639\u0631\u0636 \u062A\u0641\u0627\u0639\u0644\u064A \u2014 \u0648\u0627\u062C\u0647\u0629 \u0645\u062A\u062C\u0631 \u0628\u064A\u062A \u0627\u0644\u0639\u0632"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '6px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u0646\u0645\u0637 \u0627\u0644\u062A\u0633\u0639\u064A\u0631:"), /*#__PURE__*/React.createElement(ModeToggle, {
    wholesale: wholesale,
    onChange: setWholesale
  }))), /*#__PURE__*/React.createElement(StoreHeader, {
    cartCount: cart.reduce((s, i) => s + i.quantity, 0),
    onHome: () => setScreen('home'),
    onCart: () => setScreen('cart')
  }, /*#__PURE__*/React.createElement(SearchBar, {
    value: query,
    onChange: setQuery,
    results: results,
    onPick: h => {
      const p = window.PRODUCTS.find(x => x.id === h.id);
      setQuery('');
      openProduct(p);
    },
    onSubmit: v => {
      if (!v.trim()) return;
      setQuery('');
      go('category', () => {
        setSearchQuery(v.trim());
        setSlug(null);
      });
    }
  })), screen === 'home' ? /*#__PURE__*/React.createElement(window.HomeScreen, {
    wholesale: wholesale,
    onSelectSection: openSection
  }) : null, screen === 'category' ? /*#__PURE__*/React.createElement(window.CategoryScreen, {
    slug: slug,
    searchQuery: searchQuery,
    wholesale: wholesale,
    loading: loading,
    onSelectSection: openSection,
    onOpenProduct: openProduct,
    onAdd: add
  }) : null, screen === 'product' ? /*#__PURE__*/React.createElement(window.ProductScreen, {
    product: product,
    wholesale: wholesale,
    onSelectSection: openSection,
    onAdd: add,
    onBack: () => setScreen('home')
  }) : null, screen === 'cart' ? /*#__PURE__*/React.createElement(window.CartScreen, {
    items: cart,
    wholesale: wholesale,
    onQuantity: (key, n) => setCart(c => n <= 0 ? c.filter(i => i.key !== key) : c.map(i => i.key === key ? {
      ...i,
      quantity: n
    } : i)),
    onRemove: key => setCart(c => c.filter(i => i.key !== key)),
    onBrowse: () => setScreen('home')
  }) : null, /*#__PURE__*/React.createElement(StoreFooter, null));
}

/* Kit-only control. Upstream, wholesale mode is entered by URL param / session
   (src/js/pricing-mode.js) — there is no visible toggle in the shipped storefront yet.
   Styling reuses the mobile SectionNav pill pattern. */
function ModeToggle({
  wholesale,
  onChange
}) {
  const opt = (label, on, fn) => /*#__PURE__*/React.createElement("button", {
    onClick: fn,
    style: {
      padding: '4px 12px',
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      fontFamily: 'var(--font-core)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--fw-semibold)',
      background: on ? wholesale ? 'var(--action-wholesale)' : 'var(--primary-blue)' : 'var(--surface-card)',
      color: on ? '#fff' : 'var(--text-body)',
      border: '1px solid ' + (on ? 'transparent' : 'var(--gray-200)'),
      transition: 'all var(--dur-fast) var(--ease-standard)'
    }
  }, label);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: '4px'
    }
  }, opt('قطاعي', !wholesale, () => onChange(false)), opt('جملة', wholesale, () => onChange(true)));
}
Object.assign(window, {
  StorefrontApp
});
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(StorefrontApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/data.jsx
try { (() => {
/* Storefront demo data. Section names, slugs and icon filenames are the real rows from
   supabase/seed/001_initial_data.sql. Products are representative of the merchant's actual
   catalogue (household essentials + cleaning supplies); no product photography exists in the
   repo, so each item stands in with its section's silhouette icon. */
const ICONS = '../../assets/icons/';
const SECTIONS = [{
  slug: 'laundry',
  name: 'الغسالة',
  icon: 'laundry.svg'
}, {
  slug: 'kitchen-shelving',
  name: 'رفايع المطبخ',
  icon: 'kitchen-shelving.svg'
}, {
  slug: 'paper-goods',
  name: 'ورقيات',
  icon: 'paper-goods.svg'
}, {
  slug: 'bathroom',
  name: 'بيت الراحة',
  icon: 'bathroom.svg'
}, {
  slug: 'women',
  name: 'نص الدنيا',
  icon: 'women.svg'
}, {
  slug: 'men',
  name: 'جنتلمان',
  icon: 'men.svg'
}, {
  slug: 'reception',
  name: 'الريسبشن',
  icon: 'reception.svg'
}, {
  slug: 'baby',
  name: 'بيبي زون',
  icon: 'baby.svg'
}, {
  slug: 'footwear',
  name: 'الجزامة',
  icon: 'footwear.svg'
}, {
  slug: 'vanity',
  name: 'التسريحة',
  icon: 'vanity.svg'
}, {
  slug: 'garage',
  name: 'الجراج',
  icon: 'garage.svg'
}, {
  slug: 'cleaning',
  name: 'منظفات',
  icon: 'cleaning.svg'
}];
const PRODUCTS = [{
  id: 'p1',
  section: 'laundry',
  name: 'مسحوق غسيل أوتوماتيك',
  description: 'مسحوق عالي التركيز لكل أنواع الغسالات، يغسل ٤٠ غسلة.',
  price: 185,
  wholesale: 158,
  image: ICONS + 'laundry.svg',
  variants: [{
    value: '٥ كيلو',
    price: 185
  }, {
    value: '١٠ كيلو',
    price: 340
  }, {
    value: '٢٠ كيلو',
    price: 610,
    inStock: false
  }]
}, {
  id: 'p2',
  section: 'laundry',
  name: 'منعم ملابس مركز',
  description: 'رائحة تدوم طويلاً مع حماية لألياف الأقمشة.',
  price: 95,
  wholesale: 78,
  image: ICONS + 'laundry.svg',
  variants: [{
    value: '١ لتر',
    price: 95
  }, {
    value: '٢ لتر',
    price: 170
  }]
}, {
  id: 'p3',
  section: 'cleaning',
  name: 'أكياس قمامة سوداء',
  description: 'أكياس سميكة برباط علوي، ٢٠ كيس في الرول.',
  price: 65,
  wholesale: 52,
  image: ICONS + 'cleaning.svg',
  sizes: ['٥٠ لتر', '٧٠ لتر', '١٠٠ لتر'],
  variants: [{
    value: 'رول',
    price: 65
  }]
}, {
  id: 'p4',
  section: 'cleaning',
  name: 'بودرة تنظيف متعددة الأسطح',
  description: 'تزيل الدهون والبقع من المطبخ والحمام بسهولة.',
  price: 48,
  wholesale: 39,
  image: ICONS + 'cleaning.svg',
  variants: [{
    value: '٥٠٠ جرام',
    price: 48
  }, {
    value: '١ كيلو',
    price: 88
  }]
}, {
  id: 'p5',
  section: 'paper-goods',
  name: 'استرتش تغليف طعام',
  description: 'فيلم شفاف آمن غذائياً للحفاظ على الطعام طازجاً.',
  price: 72,
  wholesale: 58,
  image: ICONS + 'paper-goods.svg',
  variants: [{
    value: '٣٠ متر',
    price: 72
  }, {
    value: '٦٠ متر',
    price: 128
  }]
}, {
  id: 'p6',
  section: 'paper-goods',
  name: 'شنطة فويل حافظة للحرارة',
  description: 'شنطة معزولة بطبقة فويل تحفظ السخن سخن والبارد بارد.',
  price: 135,
  wholesale: 110,
  image: ICONS + 'paper-goods.svg',
  sizes: ['وسط', 'كبير'],
  variants: [{
    value: 'قطعة',
    price: 135
  }]
}, {
  id: 'p7',
  section: 'bathroom',
  name: 'شامبو للشعر العادي',
  description: 'تركيبة لطيفة للاستخدام اليومي لكل أفراد البيت.',
  price: 110,
  wholesale: 92,
  image: ICONS + 'bathroom.svg',
  variants: [{
    value: '٤٠٠ مل',
    price: 110
  }, {
    value: '٧٠٠ مل',
    price: 175
  }]
}, {
  id: 'p8',
  section: 'bathroom',
  name: 'صابون استحمام مرطب',
  description: 'عبوة اقتصادية ٦ قطع برائحة منعشة تدوم.',
  price: 84,
  wholesale: 66,
  image: ICONS + 'bathroom.svg',
  variants: [{
    value: '٦ قطع',
    price: 84
  }]
}, {
  id: 'p9',
  section: 'bathroom',
  name: 'جل استحمام + ليفة',
  description: 'جل غني بالرغوة مع ليفة استحمام مجاناً.',
  price: 126,
  image: ICONS + 'bathroom.svg',
  variants: [{
    value: 'عبوة',
    price: 126
  }]
}, {
  id: 'p10',
  section: 'kitchen-shelving',
  name: 'طقم علب حفظ الطعام',
  description: '٥ علب بلاستيك بأغطية محكمة، آمنة للميكروويف.',
  price: 210,
  wholesale: 172,
  image: ICONS + 'kitchen-shelving.svg',
  variants: [{
    value: '٥ قطع',
    price: 210
  }]
}, {
  id: 'p11',
  section: 'kitchen-shelving',
  name: 'قفازات تنظيف مطاطية',
  description: 'قفازات مطاطية سميكة مضادة للانزلاق.',
  price: 38,
  wholesale: 29,
  image: ICONS + 'kitchen-shelving.svg',
  sizes: ['وسط', 'كبير'],
  variants: [{
    value: 'زوج',
    price: 38
  }]
}, {
  id: 'p12',
  section: 'baby',
  name: 'شامبو أطفال بدون دموع',
  description: 'تركيبة خفيفة لا تسبب تهيج العين، خالية من الكحول.',
  price: 98,
  wholesale: 80,
  image: ICONS + 'baby.svg',
  variants: [{
    value: '٣٠٠ مل',
    price: 98
  }]
}];
const money = v => `${Math.round(Number(v) || 0)} ج.م`;
Object.assign(window, {
  SECTIONS,
  PRODUCTS,
  ICONS,
  money
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.CartLine = __ds_scope.CartLine;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.OrderSummary = __ds_scope.OrderSummary;

__ds_ns.PriceTag = __ds_scope.PriceTag;

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardTitle = __ds_scope.CardTitle;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.SkeletonProductCard = __ds_scope.SkeletonProductCard;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.QuantityStepper = __ds_scope.QuantityStepper;

__ds_ns.SwatchGroup = __ds_scope.SwatchGroup;

__ds_ns.ROOM_BOUNDS = __ds_scope.ROOM_BOUNDS;

__ds_ns.HouseHero = __ds_scope.HouseHero;

__ds_ns.RoomLabel = __ds_scope.RoomLabel;

__ds_ns.AdminSidebar = __ds_scope.AdminSidebar;

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.SearchBar = __ds_scope.SearchBar;

__ds_ns.SectionNav = __ds_scope.SectionNav;

__ds_ns.StoreFooter = __ds_scope.StoreFooter;

__ds_ns.StoreHeader = __ds_scope.StoreHeader;

})();
