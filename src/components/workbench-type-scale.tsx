const TYPE_SCALE_CSS = `
.workbench-type-scale [class~="text-[8px]"] { font-size: 11px; }
.workbench-type-scale [class~="text-[9px]"] { font-size: 12px; }
.workbench-type-scale [class~="text-[10px]"] { font-size: 13px; }
.workbench-type-scale [class~="text-[11px]"] { font-size: 14px; }
.workbench-type-scale [class~="text-[12px]"] { font-size: 15px; }
.workbench-type-scale [class~="text-[13px]"] { font-size: 16px; }
.workbench-type-scale [class~="text-[14px]"] { font-size: 17px; }
.workbench-type-scale [class~="text-[15px]"] { font-size: 18px; }
.workbench-type-scale [class~="text-[16px]"] { font-size: 19px; }
.workbench-type-scale .text-xs { font-size: 15px; }
.workbench-type-scale .text-sm { font-size: 17px; }
.workbench-type-scale .text-base { font-size: 19px; }
.workbench-type-scale .text-lg { font-size: 21px; }
.workbench-type-scale .text-xl { font-size: 23px; }
`;

/**
 * 仅作用于 /analyze 与 /competitors 页面的字体放大层。
 * 不改组件事件、状态或数据结构。
 */
export function WorkbenchTypeScale() {
  return <style dangerouslySetInnerHTML={{ __html: TYPE_SCALE_CSS }} />;
}
