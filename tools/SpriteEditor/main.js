/*
Toolbox Aid
David Quesenberry
03/26/2026
main.js
*/
(function () {
  "use strict";

  const CANVAS_W = 1600;
  const CANVAS_H = 900;
  const STORAGE_KEY = "sprite-editor-v21";

  class SpriteEditorDocument {
    constructor() {
      this.cols = 16;
      this.rows = 16;
      this.palette = ["#000000", "#ffffff", "#00ccff", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"];
      this.currentColor = "#00ccff";
      this.frames = [this.makeFrame("Frame 1"), this.makeFrame("Frame 2"), this.makeFrame("Frame 3")];
      this.activeFrameIndex = 0;
      this.selection = null;
      this.sheet = { layout: "horizontal", padding: 4, spacing: 2, transparent: true, backgroundColor: "#ffffff" };
    }
    makeGrid(fill = null) { return Array.from({length:this.rows},()=>Array.from({length:this.cols},()=>fill)); }
    cloneGrid(grid) { return grid.map(r=>r.slice()); }
    makeFrame(name) { return { id: "f_" + Math.random().toString(36).slice(2,10), name, pixels: this.makeGrid() }; }
    get activeFrame() { return this.frames[this.activeFrameIndex]; }
    setPixel(x,y,v,mirror=false){
      if(x<0||y<0||x>=this.cols||y>=this.rows) return;
      this.activeFrame.pixels[y][x]=v;
      if(mirror){ const mx=this.cols-1-x; if(mx>=0&&mx<this.cols) this.activeFrame.pixels[y][mx]=v; }
    }
    getPixel(x,y){ return (x<0||y<0||x>=this.cols||y>=this.rows)?null:this.activeFrame.pixels[y][x]; }
    addFrame(){ this.frames.push(this.makeFrame("Frame "+(this.frames.length+1))); this.activeFrameIndex=this.frames.length-1; }
    duplicateFrame(){ const f=this.activeFrame; this.frames.splice(this.activeFrameIndex+1,0,{id:"f_"+Math.random().toString(36).slice(2,10),name:f.name+" Copy",pixels:this.cloneGrid(f.pixels)}); this.activeFrameIndex++; }
    deleteFrame(){ if(this.frames.length===1) return false; this.frames.splice(this.activeFrameIndex,1); this.activeFrameIndex=Math.min(this.activeFrameIndex,this.frames.length-1); return true; }
    moveFrame(from,to){ if(from===to||from<0||to<0||from>=this.frames.length||to>=this.frames.length) return false; const [f]=this.frames.splice(from,1); this.frames.splice(to,0,f); this.activeFrameIndex=to; return true; }
    buildExportPayload(){ return {version:21,kind:"sprite-editor-v2.1",cols:this.cols,rows:this.rows,palette:this.palette,currentColor:this.currentColor,sheet:this.sheet,frames:this.frames.map(f=>({id:f.id,name:f.name,pixels:this.cloneGrid(f.pixels)}))}; }
    importPayload(p){ this.cols=p.cols||16; this.rows=p.rows||16; this.palette=Array.isArray(p.palette)&&p.palette.length?p.palette:this.palette; this.currentColor=p.currentColor||this.palette[0]; this.sheet={...this.sheet,...(p.sheet||{})}; if(Array.isArray(p.frames)&&p.frames.length){ this.frames=p.frames.map((f,i)=>({id:f.id||("f_"+i),name:f.name||("Frame "+(i+1)),pixels:f.pixels||this.makeGrid()})); } this.activeFrameIndex=0; }
    computeSheetPlacement(){ const c=this.frames.length,p=this.sheet.padding,s=this.sheet.spacing; let cols=1,rows=1; if(this.sheet.layout==="horizontal"){cols=c;rows=1;} else if(this.sheet.layout==="vertical"){cols=1;rows=c;} else { cols=Math.min(4,c); rows=Math.ceil(c/cols); } const entries=[]; for(let i=0;i<c;i++){ const col=i%cols,row=Math.floor(i/cols); entries.push({x:p+col*(this.cols+s),y:p+row*(this.rows+s)}); } return {width:p*2+cols*this.cols+Math.max(0,cols-1)*s,height:p*2+rows*this.rows+Math.max(0,rows-1)*s,entries}; }
    buildSheetMetadata(){ const plc=this.computeSheetPlacement(); return {version:1,kind:"sprite-sheet",frames:this.frames.map((f,i)=>({index:i,id:f.id,name:f.name,x:plc.entries[i].x,y:plc.entries[i].y,width:this.cols,height:this.rows}))}; }
  }

  class SpriteEditorCanvasControlSurface {
    constructor(app){ this.app=app; this.controls=[]; this.hovered=null; this.pressed=null; this.dragFrameIndex=null; this.dragOverFrameIndex=null; this.layout=null; }
    rebuildLayout(w,h){
      const m=18; let fw=w-m*2, fh=Math.floor(fw*9/16); if(fh>h-m*2){ fh=h-m*2; fw=Math.floor(fh*16/9); }
      const frame={x:Math.floor((w-fw)/2),y:Math.floor((h-fh)/2),width:fw,height:fh};
      const top=82,bottom=138,left=230,right=310,pad=18;
      this.layout={canvasWidth:w,canvasHeight:h,appFrame:frame,topPanel:{x:frame.x,y:frame.y,width:fw,height:top},leftPanel:{x:frame.x,y:frame.y+top,width:left,height:fh-top-bottom},rightPanel:{x:frame.x+fw-right,y:frame.y+top,width:right,height:fh-top-bottom},bottomPanel:{x:frame.x,y:frame.y+fh-bottom,width:fw,height:bottom},gridArea:{x:frame.x+left+pad,y:frame.y+top+pad,width:fw-left-right-pad*2,height:fh-top-bottom-pad*2}};
      this.controls=[]; this.build();
    }
    add(kind,id,x,y,w,h,text,action,extra={}){ this.controls.push({kind,id,x,y,w,h,text,action,...extra}); }
    build(){
      const top=this.layout.topPanel,left=this.layout.leftPanel,right=this.layout.rightPanel,bottom=this.layout.bottomPanel;
      let x=top.x+16,y=top.y+20,h=42;
      [["save","Save",()=>this.app.saveLocal()],["load","Load",()=>this.app.loadLocal()],["import","Import",()=>this.app.openImport()],["json","Export JSON",()=>this.app.exportJson(true)],["png","PNG Sheet",()=>this.app.downloadSheetPng()],["meta","Sheet Meta",()=>this.app.exportSheetMetadata()]].forEach(([id,t,a],i)=>{ const w=id==="json"?116:id==="meta"?118:id==="png"?102:88; this.add("button","top-"+id,x,y,w,h,t,a); x+=w+8;});
      this.add("button","fullscreen",top.x+top.width-122,y,106,h,this.app.isFullscreen()?"Exit Full":"Full Screen",()=>this.app.toggleFullscreen());
      x=left.x+18; y=left.y+18; const bw=left.width-36,bh=38;
      this.add("label","lbl-tools",x,y,bw,24,"TOOLS",null); y+=28;
      [["brush","Brush"],["erase","Erase"],["fill","Fill"],["eyedropper","Eye"],["select","Select"]].forEach(([tool,t])=>{ this.add("button","tool-"+tool,x,y,bw,bh,t,()=>this.app.setTool(tool),{tool}); y+=46; });
      y+=8; this.add("label","lbl-sel",x,y,bw,24,"SELECTION",null); y+=28;
      [["copy","Copy"],["cut","Cut"],["paste","Paste"],["fliph","Flip H"],["flipv","Flip V"],["clear","Clear"]].forEach(([id,t])=>{ this.add("button","sel-"+id,x,y,bw,bh,t,()=>this.app.handleSelectionAction("sel-"+id)); y+=46; });
      y+=8; this.add("label","lbl-sheet",x,y,bw,24,"SHEET",null); y+=28;
      this.add("button","sheet-layout",x,y,bw,bh,"Layout: "+this.app.document.sheet.layout,()=>this.app.cycleSheetLayout()); y+=46;
      this.add("button","sheet-padding",x,y,bw,bh,"Padding: "+this.app.document.sheet.padding,()=>this.app.adjustSheetPadding(1)); y+=46;
      this.add("button","sheet-spacing",x,y,bw,bh,"Spacing: "+this.app.document.sheet.spacing,()=>this.app.adjustSheetSpacing(1)); y+=46;
      this.add("button","sheet-bg",x,y,bw,bh,this.app.document.sheet.transparent?"BG: Transparent":"BG: Solid",()=>this.app.toggleSheetBackgroundMode());

      x=right.x+18; y=right.y+18; const rw=right.width-36;
      this.add("label","lbl-frames",x,y,rw,24,"FRAMES",null); y+=28;
      [["add","Add Frame",()=>this.app.addFrame()],["dup","Duplicate",()=>this.app.duplicateFrame()],["del","Delete",()=>this.app.deleteFrame()],["copy","Copy Frame",()=>this.app.copyFrame()],["paste","Paste Frame",()=>this.app.pasteFrame()]].forEach(([id,t,a])=>{ this.add("button","frame-"+id,x,y,rw,bh,t,a); y+=46; });
      this.app.document.frames.forEach((f,i)=>{ this.add("frame","frame-thumb-"+i,x,y,rw,58,f.name,()=>this.app.selectFrame(i),{frameIndex:i}); y+=66; });

      x=bottom.x+18; y=bottom.y+22;
      this.add("label","lbl-palette",x,y-16,180,16,"PALETTE",null);
      this.app.document.palette.forEach((c,i)=>{ this.add("palette","palette-"+i,x,y,34,34,"",()=>this.app.setCurrentColor(c),{color:c}); x+=42; });
      x+=18;
      this.add("button","color-next",x,y,84,34,"Next",()=>this.app.nextColor()); x+=92;
      this.add("button","mirror-toggle",x,y,108,34,this.app.mirror?"Mirror: On":"Mirror: Off",()=>this.app.toggleMirror());
    }
    getControlAt(x,y){ for(let i=this.controls.length-1;i>=0;i--){ const c=this.controls[i]; if(c.kind==="label") continue; if(x>=c.x&&y>=c.y&&x<=c.x+c.w&&y<=c.y+c.h) return c; } return null; }
    updateHover(x,y){ const c=this.getControlAt(x,y); this.hovered=c?c.id:null; if(this.dragFrameIndex!==null) this.dragOverFrameIndex=c&&c.kind==="frame"?c.frameIndex:null; }
    pointerDown(x,y){ const c=this.getControlAt(x,y); this.pressed=c?c.id:null; if(c&&c.kind==="frame"){ this.dragFrameIndex=c.frameIndex; this.dragOverFrameIndex=c.frameIndex; } return c; }
    pointerUp(x,y){
      const c=this.getControlAt(x,y);
      const from=this.dragFrameIndex,to=this.dragOverFrameIndex;
      this.dragFrameIndex=null; this.dragOverFrameIndex=null;
      if(from!==null&&to!==null&&from!==to){ this.pressed=null; this.app.reorderFrame(from,to); return true; }
      const ok=c&&c.id===this.pressed; this.pressed=null; if(!ok) return false; if(typeof c.action==="function"){ c.action(); return true; } return false;
    }
    draw(ctx){
      const L=this.layout, F=L.appFrame;
      ctx.fillStyle="#0c1118"; ctx.fillRect(0,0,L.canvasWidth,L.canvasHeight);
      ctx.fillStyle="#121b25"; ctx.fillRect(F.x,F.y,F.width,F.height);
      ctx.strokeStyle="rgba(255,255,255,0.10)"; ctx.strokeRect(F.x+0.5,F.y+0.5,F.width-1,F.height-1);
      [L.topPanel,L.leftPanel,L.rightPanel,L.bottomPanel].forEach(p=>{ ctx.fillStyle="#16202b"; ctx.fillRect(p.x,p.y,p.width,p.height); ctx.strokeStyle="rgba(255,255,255,0.08)"; ctx.strokeRect(p.x+0.5,p.y+0.5,p.width-1,p.height-1); });
      ctx.font="13px Arial"; ctx.textBaseline="middle";
      this.controls.forEach(c=>this.drawControl(ctx,c));
      ctx.fillStyle="#dbe7f3"; ctx.font="bold 18px Arial"; ctx.fillText("Sprite Editor v2.1", L.topPanel.x + L.topPanel.width/2 - 90, L.topPanel.y + 40);
      if(this.dragFrameIndex!==null&&this.dragOverFrameIndex!==null){ ctx.fillStyle="#4cc9f0"; ctx.font="12px Arial"; ctx.fillText("Drag reorder: "+(this.dragFrameIndex+1)+" → "+(this.dragOverFrameIndex+1), L.rightPanel.x+18, L.rightPanel.y+L.rightPanel.height-14); }
    }
    drawControl(ctx,c){
      if(c.kind==="label"){ ctx.fillStyle="#91a3b6"; ctx.font="bold 12px Arial"; ctx.fillText(c.text,c.x,c.y+c.h/2); return; }
      if(c.kind==="palette"){ ctx.fillStyle=c.color; ctx.fillRect(c.x,c.y,c.w,c.h); const current=this.app.document.currentColor===c.color; ctx.strokeStyle=current?"#4cc9f0":"rgba(255,255,255,0.2)"; ctx.lineWidth=current?3:1; ctx.strokeRect(c.x+0.5,c.y+0.5,c.w-1,c.h-1); return; }
      const hovered=this.hovered===c.id, pressed=this.pressed===c.id, activeFrame=c.kind==="frame"&&this.app.document.activeFrameIndex===c.frameIndex, dragTarget=c.kind==="frame"&&this.dragOverFrameIndex===c.frameIndex&&this.dragFrameIndex!==null, toolActive=c.tool&&this.app.activeTool===c.tool;
      ctx.fillStyle=pressed?"#27435a":(hovered?"#223444":"#1a2733"); if(toolActive||activeFrame) ctx.fillStyle="#244d67"; if(dragTarget) ctx.fillStyle="#305c4a";
      ctx.fillRect(c.x,c.y,c.w,c.h); ctx.strokeStyle=(toolActive||activeFrame||dragTarget)?"#4cc9f0":"rgba(255,255,255,0.15)"; ctx.strokeRect(c.x+0.5,c.y+0.5,c.w-1,c.h-1);
      ctx.fillStyle="#edf2f7"; ctx.font=c.kind==="frame"?"12px Arial":"13px Arial"; ctx.fillText(c.text,c.x+10,c.y+c.h/2);
      if(c.kind==="frame"){ const f=this.app.document.frames[c.frameIndex]; this.drawMiniFrame(ctx,f.pixels,c.x+c.w-54,c.y+8,46,c.h-16); }
    }
    drawMiniFrame(ctx,pixels,x,y,w,h){
      const cols=this.app.document.cols, rows=this.app.document.rows, pw=Math.max(1,Math.floor(w/cols)), ph=Math.max(1,Math.floor(h/rows));
      ctx.fillStyle="#fff"; ctx.fillRect(x,y,w,h);
      for(let py=0;py<rows;py++) for(let px=0;px<cols;px++){ const v=pixels[py][px]; if(!v) continue; ctx.fillStyle=v; ctx.fillRect(x+px*pw,y+py*ph,pw,ph); }
      ctx.strokeStyle="rgba(0,0,0,0.2)"; ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
    }
  }

  class SpriteEditorApp {
    constructor(canvas, fileInput, downloadLink){
      this.canvas=canvas; this.ctx=canvas.getContext("2d"); this.fileInput=fileInput; this.downloadLink=downloadLink;
      this.document=new SpriteEditorDocument(); this.controlSurface=new SpriteEditorCanvasControlSurface(this);
      this.activeTool="brush"; this.hoveredGridCell=null; this.isPointerDown=false; this.mirror=false; this.selectionStart=null; this.selectionPasteOrigin={x:0,y:0};
      this.playback={isPlaying:false,fps:6,loop:true,previewFrameIndex:0,lastTick:0}; this.statusMessage="Canvas-native editor ready."; this.flashMessageUntil=0; this.gridRect=null;
      this.resizeCanvas(); this.bindEvents(); this.renderAll(); requestAnimationFrame(ts=>this.tick(ts));
    }
    bindEvents(){
      window.addEventListener("resize",()=>{ this.resizeCanvas(); this.renderAll(); });
      document.addEventListener("fullscreenchange",()=>{ this.renderAll(); });
      this.canvas.addEventListener("pointermove",e=>this.onPointerMove(e));
      this.canvas.addEventListener("pointerdown",e=>this.onPointerDown(e));
      window.addEventListener("pointerup",e=>this.onPointerUp(e));
      this.canvas.addEventListener("contextmenu",e=>e.preventDefault());
      window.addEventListener("keydown",e=>this.onKeyDown(e));
      this.fileInput.addEventListener("change", async (event) => {
        const file=event.target.files&&event.target.files[0]; if(!file) return;
        try{ this.document.importPayload(JSON.parse(await file.text())); this.showMessage("Imported sprite JSON."); } catch(_e){ this.showMessage("Import failed."); }
        this.fileInput.value=""; this.renderAll();
      });
    }
    resizeCanvas(){ this.canvas.width=CANVAS_W; this.canvas.height=CANVAS_H; this.controlSurface.rebuildLayout(CANVAS_W,CANVAS_H); this.gridRect=this.computeGridRect(); }
    isFullscreen(){ return document.fullscreenElement===this.canvas.parentElement; }
    async toggleFullscreen(){ try{ if(this.isFullscreen()) await document.exitFullscreen(); else await this.canvas.parentElement.requestFullscreen(); this.showMessage(this.isFullscreen()?"Exited full screen.":"Entered full screen."); } catch(_e){ this.showMessage("Full screen unavailable."); } this.renderAll(); }
    computeGridRect(){ const a=this.controlSurface.layout.gridArea, ps=Math.max(12,Math.floor(Math.min(a.width/this.document.cols,a.height/this.document.rows))); const w=this.document.cols*ps,h=this.document.rows*ps; return {x:a.x+Math.floor((a.width-w)/2),y:a.y+Math.floor((a.height-h)/2),width:w,height:h,pixelSize:ps}; }
    getCanvasPoint(e){ const r=this.canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*(this.canvas.width/r.width),y:(e.clientY-r.top)*(this.canvas.height/r.height)}; }
    getGridCellAt(x,y){ const r=this.gridRect; if(!r||x<r.x||y<r.y||x>r.x+r.width||y>r.y+r.height) return null; return {x:Math.floor((x-r.x)/r.pixelSize),y:Math.floor((y-r.y)/r.pixelSize)}; }
    onPointerMove(e){ const p=this.getCanvasPoint(e); this.controlSurface.updateHover(p.x,p.y); const cell=this.getGridCellAt(p.x,p.y); this.hoveredGridCell=cell;
      if(this.isPointerDown){ if(this.activeTool==="select"&&this.selectionStart&&cell){ this.setSelectionFromTwoCells(this.selectionStart,cell); this.renderAll(); return; }
        if(cell&&this.activeTool!=="select"){ this.applyGridTool(cell.x,cell.y,e.buttons===2); this.renderAll(); } }
      else this.renderAll();
    }
    onPointerDown(e){ const p=this.getCanvasPoint(e), control=this.controlSurface.pointerDown(p.x,p.y); if(control){ this.renderAll(); return; } const cell=this.getGridCellAt(p.x,p.y); if(!cell) return; this.isPointerDown=true; this.hoveredGridCell=cell; if(this.activeTool==="select"){ this.selectionStart=cell; this.setSelectionFromTwoCells(cell,cell); this.renderAll(); return; } this.applyGridTool(cell.x,cell.y,e.button===2); this.renderAll(); }
    onPointerUp(e){ const p=this.getCanvasPoint(e); if(this.controlSurface.pointerUp(p.x,p.y)) this.renderAll(); this.isPointerDown=false; this.selectionStart=null; }
    onKeyDown(e){
      const k=e.key.toLowerCase();
      if(k==="b") this.setTool("brush"); else if(k==="e") this.setTool("erase"); else if(k==="f") this.setTool("fill"); else if(k==="i") this.setTool("eyedropper"); else if(k==="s") this.setTool("select");
      else if(k==="p") this.togglePlayback(); else if(k==="[") this.selectFrame(this.document.activeFrameIndex-1); else if(k==="]") this.selectFrame(this.document.activeFrameIndex+1); else if(e.shiftKey&&k==="f") this.toggleFullscreen();
      else if(e.ctrlKey&&k==="c"){ if(this.document.selection) this.handleSelectionAction("sel-copy"); } else if(e.ctrlKey&&k==="x"){ if(this.document.selection) this.handleSelectionAction("sel-cut"); } else if(e.ctrlKey&&k==="v"){ if(this.document.selectionClipboard) this.handleSelectionAction("sel-paste"); }
      else if(k==="delete"){ if(this.document.selection) this.handleSelectionAction("sel-cut"); else this.document.clearFrame(); }
      else return;
      e.preventDefault(); this.renderAll();
    }
    setSelectionFromTwoCells(a,b){ const l=Math.min(a.x,b.x),t=Math.min(a.y,b.y),r=Math.max(a.x,b.x),bt=Math.max(a.y,b.y); this.document.setSelection({x:l,y:t,width:r-l+1,height:bt-t+1}); this.selectionPasteOrigin={x:l,y:t}; }
    applyGridTool(x,y,erase){ if(this.activeTool==="eyedropper"){ const v=this.document.getPixel(x,y); if(v) this.setCurrentColor(v); this.showMessage("Picked color."); return; } if(this.activeTool==="fill"){ this.document.floodFill(x,y,erase?null:this.document.currentColor,this.mirror); return; } this.document.setPixel(x,y,(erase||this.activeTool==="erase")?null:this.document.currentColor,this.mirror); }
    setTool(t){ this.activeTool=t; this.showMessage("Tool: "+t); }
    setCurrentColor(c){ this.document.currentColor=c; this.showMessage("Color selected."); }
    nextColor(){ const p=this.document.palette, i=p.indexOf(this.document.currentColor), n=i>=0?(i+1)%p.length:0; this.document.currentColor=p[n]; this.showMessage("Color cycled."); this.renderAll(); }
    toggleMirror(){ this.mirror=!this.mirror; this.showMessage(this.mirror?"Mirror on.":"Mirror off."); this.renderAll(); }
    handleSelectionAction(id){ let ok=false; if(id==="sel-copy") ok=this.document.copySelection(); else if(id==="sel-cut") ok=this.document.cutSelection(); else if(id==="sel-paste") ok=this.document.pasteSelection(this.selectionPasteOrigin.x,this.selectionPasteOrigin.y); else if(id==="sel-fliph") ok=this.document.flipSelection(true); else if(id==="sel-flipv") ok=this.document.flipSelection(false); else if(id==="sel-clear"){ this.document.clearSelection(); ok=true; } this.showMessage(ok?"Selection updated.":"No active selection."); this.renderAll(); }
    addFrame(){ this.document.addFrame(); this.showMessage("Frame added."); this.renderAll(); }
    duplicateFrame(){ this.document.duplicateFrame(); this.showMessage("Frame duplicated."); this.renderAll(); }
    deleteFrame(){ this.showMessage(this.document.deleteFrame()?"Frame deleted.":"Cannot delete last frame."); this.renderAll(); }
    reorderFrame(from,to){ this.showMessage(this.document.moveFrame(from,to)?"Frame reordered.":"Frame reorder failed."); this.renderAll(); }
    selectFrame(i){ this.document.activeFrameIndex=Math.max(0,Math.min(i,this.document.frames.length-1)); this.playback.previewFrameIndex=this.document.activeFrameIndex; this.document.clearSelection(); this.renderAll(); }
    copyFrame(){ this.document.copyFrame(); this.showMessage("Frame copied."); this.renderAll(); }
    pasteFrame(){ this.showMessage(this.document.pasteFrame()?"Frame pasted.":"No copied frame."); this.renderAll(); }
    cycleSheetLayout(){ const order=["horizontal","vertical","grid"], i=order.indexOf(this.document.sheet.layout); this.document.sheet.layout=order[(i+1)%order.length]; this.showMessage("Sheet layout: "+this.document.sheet.layout); this.renderAll(); }
    adjustSheetPadding(d){ this.document.sheet.padding=Math.max(0,Math.min(64,this.document.sheet.padding+d)); this.showMessage("Sheet padding: "+this.document.sheet.padding); this.renderAll(); }
    adjustSheetSpacing(d){ this.document.sheet.spacing=Math.max(0,Math.min(32,this.document.sheet.spacing+d)); this.showMessage("Sheet spacing: "+this.document.sheet.spacing); this.renderAll(); }
    toggleSheetBackgroundMode(){ this.document.sheet.transparent=!this.document.sheet.transparent; this.showMessage(this.document.sheet.transparent?"Sheet background transparent.":"Sheet background solid."); this.renderAll(); }
    togglePlayback(force){ if(typeof force==="boolean") this.playback.isPlaying=force; else this.playback.isPlaying=!this.playback.isPlaying; if(this.playback.isPlaying){ this.playback.previewFrameIndex=0; this.playback.lastTick=performance.now(); } this.showMessage(this.playback.isPlaying?"Playback started.":"Playback paused."); this.renderAll(); }
    saveLocal(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(this.document.buildExportPayload())); this.showMessage("Saved locally."); }
    loadLocal(){ const raw=localStorage.getItem(STORAGE_KEY); if(!raw){ this.showMessage("No local save."); return; } try{ this.document.importPayload(JSON.parse(raw)); this.showMessage("Loaded local save."); } catch(_e){ this.showMessage("Load failed."); } this.renderAll(); }
    openImport(){ this.fileInput.click(); }
    exportJson(pretty){ this.downloadBlob("sprite-editor.json",JSON.stringify(this.document.buildExportPayload(),null,pretty?2:0),"application/json"); this.showMessage("JSON exported."); }
    exportSheetMetadata(){ this.downloadBlob("sprite-sheet-meta.json",JSON.stringify(this.document.buildSheetMetadata(),null,2),"application/json"); this.showMessage("Sheet metadata exported."); }
    downloadSheetPng(){
      const plc=this.document.computeSheetPlacement(), temp=document.createElement("canvas");
      temp.width=plc.width; temp.height=plc.height;
      const ctx=temp.getContext("2d");
      this.drawSheetPreview(ctx,{x:0,y:0,width:plc.width,height:plc.height},false);
      this.downloadLink.download="sprite-sheet.png";
      this.downloadLink.href=temp.toDataURL("image/png");
      this.downloadLink.click();
      this.showMessage("PNG sheet exported.");
    }
    downloadBlob(name,text,mime){ const blob=new Blob([text],{type:mime}), url=URL.createObjectURL(blob); this.downloadLink.download=name; this.downloadLink.href=url; this.downloadLink.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
    showMessage(m){ this.statusMessage=m; this.flashMessageUntil=performance.now()+1800; }
    tick(ts){ if(this.playback.isPlaying){ const fd=1000/this.playback.fps; if(ts-this.playback.lastTick>=fd){ this.playback.lastTick=ts; if(this.playback.previewFrameIndex<this.document.frames.length-1) this.playback.previewFrameIndex++; else if(this.playback.loop) this.playback.previewFrameIndex=0; else this.playback.isPlaying=false; this.renderAll(); } } requestAnimationFrame(t=>this.tick(t)); }
    renderAll(){ this.controlSurface.rebuildLayout(CANVAS_W,CANVAS_H); this.gridRect=this.computeGridRect(); this.controlSurface.draw(this.ctx); this.drawMainGrid(); this.drawPreviewPanel(); this.drawSheetPanel(); this.drawBottomStatus(); }
    drawMainGrid(){
      const r=this.gridRect, ctx=this.ctx, pixels=this.document.activeFrame.pixels;
      ctx.fillStyle="#fff"; ctx.fillRect(r.x,r.y,r.width,r.height);
      for(let y=0;y<this.document.rows;y++) for(let x=0;x<this.document.cols;x++){ const v=pixels[y][x]; ctx.fillStyle=v||(((x+y)%2===0)?"#f8fafc":"#e2e8f0"); ctx.fillRect(r.x+x*r.pixelSize,r.y+y*r.pixelSize,r.pixelSize,r.pixelSize); }
      ctx.strokeStyle="rgba(0,0,0,0.18)";
      for(let x=0;x<=this.document.cols;x++){ ctx.beginPath(); ctx.moveTo(r.x+x*r.pixelSize+0.5,r.y); ctx.lineTo(r.x+x*r.pixelSize+0.5,r.y+r.height); ctx.stroke(); }
      for(let y=0;y<=this.document.rows;y++){ ctx.beginPath(); ctx.moveTo(r.x,r.y+y*r.pixelSize+0.5); ctx.lineTo(r.x+r.width,r.y+y*r.pixelSize+0.5); ctx.stroke(); }
      if(this.hoveredGridCell){ ctx.strokeStyle="#4cc9f0"; ctx.lineWidth=2; ctx.strokeRect(r.x+this.hoveredGridCell.x*r.pixelSize+1,r.y+this.hoveredGridCell.y*r.pixelSize+1,r.pixelSize-2,r.pixelSize-2); }
      if(this.document.selection){ ctx.strokeStyle="#ff9800"; ctx.lineWidth=3; ctx.strokeRect(r.x+this.document.selection.x*r.pixelSize+1,r.y+this.document.selection.y*r.pixelSize+1,this.document.selection.width*r.pixelSize-2,this.document.selection.height*r.pixelSize-2); }
    }
    drawPreviewPanel(){
      const p=this.controlSurface.layout.rightPanel, x=p.x+18, y=p.y+p.height-248, w=p.width-36, h=98;
      this.ctx.fillStyle="#1a2733"; this.ctx.fillRect(x,y,w,h); this.ctx.strokeStyle="rgba(255,255,255,0.15)"; this.ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
      this.ctx.fillStyle="#dbe7f3"; this.ctx.font="bold 12px Arial"; this.ctx.fillText("ANIMATION PREVIEW",x+12,y+16);
      const f=this.playback.isPlaying?this.document.frames[this.playback.previewFrameIndex]:this.document.activeFrame; this.drawMiniPixels(f.pixels,x+12,y+24,72,72);
      this.ctx.font="12px Arial"; this.ctx.fillText("Frame "+(this.document.activeFrameIndex+1)+" / "+this.document.frames.length,x+96,y+36); this.ctx.fillText(this.playback.isPlaying?"Playing":"Paused",x+96,y+58); this.ctx.fillText("P play/pause  [ ] frame",x+96,y+80);
    }
    drawSheetPanel(){ const p=this.controlSurface.layout.rightPanel, x=p.x+18, y=p.y+p.height-140, w=p.width-36, h=104; this.drawSheetPreview(this.ctx,{x,y,width:w,height:h},true); }
    drawSheetPreview(ctx,rect,withChrome){
      const plc=this.document.computeSheetPlacement();
      if(withChrome){ ctx.fillStyle="#1a2733"; ctx.fillRect(rect.x,rect.y,rect.width,rect.height); ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.strokeRect(rect.x+0.5,rect.y+0.5,rect.width-1,rect.height-1); ctx.fillStyle="#dbe7f3"; ctx.font="bold 12px Arial"; ctx.fillText("SHEET PREVIEW",rect.x+12,rect.y+16); }
      const cx=rect.x+(withChrome?12:0), cy=rect.y+(withChrome?24:0), cw=rect.width-(withChrome?24:0), ch=rect.height-(withChrome?32:0), scale=Math.max(1,Math.floor(Math.min(cw/plc.width,ch/plc.height)));
      if(this.document.sheet.transparent) this.drawCheckerboard(ctx,cx,cy,plc.width*scale,plc.height*scale,Math.max(4,scale)); else { ctx.fillStyle=this.document.sheet.backgroundColor; ctx.fillRect(cx,cy,plc.width*scale,plc.height*scale); }
      this.document.frames.forEach((f,i)=>{ const e=plc.entries[i]; for(let y=0;y<this.document.rows;y++) for(let x=0;x<this.document.cols;x++){ const v=f.pixels[y][x]; if(!v) continue; ctx.fillStyle=v; ctx.fillRect(cx+(e.x+x)*scale,cy+(e.y+y)*scale,scale,scale); } });
      if(withChrome){ ctx.fillStyle="#dbe7f3"; ctx.font="11px Arial"; ctx.fillText("Order: "+this.document.frames.map((_,i)=>i+1).join(", "),rect.x+12,rect.y+rect.height-10); }
    }
    drawMiniPixels(pixels,x,y,w,h){ const cols=this.document.cols, rows=this.document.rows, pw=Math.max(1,Math.floor(w/cols)), ph=Math.max(1,Math.floor(h/rows)); this.ctx.fillStyle="#fff"; this.ctx.fillRect(x,y,w,h); for(let py=0;py<rows;py++) for(let px=0;px<cols;px++){ const v=pixels[py][px]; if(!v) continue; this.ctx.fillStyle=v; this.ctx.fillRect(x+px*pw,y+py*ph,pw,ph); } this.ctx.strokeStyle="rgba(0,0,0,0.2)"; this.ctx.strokeRect(x+0.5,y+0.5,w-1,h-1); }
    drawCheckerboard(ctx,x,y,w,h,b){ for(let py=0;py<h;py+=b) for(let px=0;px<w;px+=b){ ctx.fillStyle=((Math.floor(px/b)+Math.floor(py/b))%2===0)?"#f8fafc":"#e2e8f0"; ctx.fillRect(x+px,y+py,b,b); } }
    drawBottomStatus(){ const b=this.controlSurface.layout.bottomPanel, y=b.y+78; const sel=this.document.selection?`Selection ${this.document.selection.width}x${this.document.selection.height} @ ${this.document.selection.x},${this.document.selection.y}`:"No selection"; const hover=this.hoveredGridCell?`Cell ${this.hoveredGridCell.x},${this.hoveredGridCell.y}`:"Cell -"; this.ctx.fillStyle="#dbe7f3"; this.ctx.font="12px Arial"; this.ctx.fillText(`Tool: ${this.activeTool}   |   ${hover}   |   ${sel}   |   16:9 canvas`,b.x+18,y); this.ctx.fillText("B brush  E erase  F fill  I eye  S select  P play/pause  [ ] frame  Shift+F full",b.x+18,y+22); this.ctx.fillStyle=performance.now()<this.flashMessageUntil?"#4cc9f0":"#91a3b6"; this.ctx.fillText(this.statusMessage,b.x+b.width-360,y); }
  }

  const canvas=document.getElementById("spriteEditorCanvas");
  const fileInput=document.getElementById("spriteEditorFileInput");
  const downloadLink=document.getElementById("spriteEditorDownloadLink");
  new SpriteEditorApp(canvas,fileInput,downloadLink);
})();
