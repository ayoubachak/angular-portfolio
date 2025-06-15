import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHADERS, Program, Material } from './shaders';

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: ColorRGB;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

@Component({
  selector: 'app-splash-cursor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-cursor-container">
      <canvas 
        #fluidCanvas 
        id="fluid"
        class="splash-cursor-canvas">
      </canvas>
    </div>
  `,
  styles: [`
    .splash-cursor-container {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
      pointer-events: none;
      width: 100%;
      height: 100%;
    }
    
    .splash-cursor-canvas {
      width: 100vw;
      height: 100vh;
      display: block;
    }
  `]
})
export class SplashCursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('fluidCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() SIM_RESOLUTION = 128;
  @Input() DYE_RESOLUTION = 512;
  @Input() DENSITY_DISSIPATION = 1.0;
  @Input() VELOCITY_DISSIPATION = 0.2;
  @Input() PRESSURE = 0.8;
  @Input() PRESSURE_ITERATIONS = 20;
  @Input() CURL = 30;
  @Input() SPLAT_RADIUS = 0.25;
  @Input() SPLAT_FORCE = 6000;
  @Input() SHADING = true;
  @Input() COLOR_UPDATE_SPEED = 10;
  @Input() BACK_COLOR: ColorRGB = { r: 0, g: 0, b: 0 };
  @Input() TRANSPARENT = true;

  private gl!: WebGL2RenderingContext;
  private ext: any;
  private config: any;
  private pointers: Pointer[] = [];
  private programs: any = {};
  private displayMaterial!: Material;
  private dye!: DoubleFBO;
  private velocity!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;
  private pressure!: DoubleFBO;
  private blit!: (target: FBO | null, clear?: boolean) => void;
  private animationId: number | null = null;
  private lastUpdateTime = Date.now();
  private colorUpdateTimer = 0.0;

  // Event handlers
  private mouseDownHandler = this.onMouseDown.bind(this);
  private mouseMoveHandler = this.onMouseMove.bind(this);
  private touchStartHandler = this.onTouchStart.bind(this);
  private touchMoveHandler = this.onTouchMove.bind(this);
  private touchEndHandler = this.onTouchEnd.bind(this);
  private firstMouseMoveHandler = this.handleFirstMouseMove.bind(this);
  private firstTouchStartHandler = this.handleFirstTouchStart.bind(this);

  ngAfterViewInit(): void {
    this.initializeFluidSimulation();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initializeFluidSimulation(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas) return;

    this.pointers = [this.createPointerPrototype()];
    this.config = {
      SIM_RESOLUTION: this.SIM_RESOLUTION,
      DYE_RESOLUTION: this.DYE_RESOLUTION,
      DENSITY_DISSIPATION: this.DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION: this.VELOCITY_DISSIPATION,
      PRESSURE: this.PRESSURE,
      PRESSURE_ITERATIONS: this.PRESSURE_ITERATIONS,
      CURL: this.CURL,
      SPLAT_RADIUS: this.SPLAT_RADIUS,
      SPLAT_FORCE: this.SPLAT_FORCE,
      SHADING: this.SHADING,
      COLOR_UPDATE_SPEED: this.COLOR_UPDATE_SPEED,
      PAUSED: false,
      BACK_COLOR: this.BACK_COLOR,
      TRANSPARENT: this.TRANSPARENT,
    };

    const webglContext = this.getWebGLContext(canvas);
    if (!webglContext.gl || !webglContext.ext) return;

    this.gl = webglContext.gl;
    this.ext = webglContext.ext;

    if (!this.ext.supportLinearFiltering) {
      this.config.DYE_RESOLUTION = 256;
      this.config.SHADING = false;
    }

    this.initializeShaders();
    this.initFramebuffers();
    this.updateKeywords();
    this.addEventListeners();
    this.startAnimation();
  }

  private createPointerPrototype(): Pointer {
    return {
      id: -1,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      down: false,
      moved: false,
      color: { r: 0, g: 0, b: 0 },
    };
  }

  private getWebGLContext(canvas: HTMLCanvasElement) {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };

    let gl = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;

    if (!gl) {
      gl = (canvas.getContext('webgl', params) ||
        canvas.getContext('experimental-webgl', params)) as WebGL2RenderingContext | null;
    }

    if (!gl) {
      throw new Error('Unable to initialize WebGL.');
    }

    const isWebGL2 = 'drawBuffers' in gl;
    let supportLinearFiltering = false;
    let halfFloat = null;

    if (isWebGL2) {
      (gl as WebGL2RenderingContext).getExtension('EXT_color_buffer_float');
      supportLinearFiltering = !!(gl as WebGL2RenderingContext).getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0, 0, 0, 1);

    const halfFloatTexType = isWebGL2
      ? (gl as WebGL2RenderingContext).HALF_FLOAT
      : (halfFloat && (halfFloat as any).HALF_FLOAT_OES) || 0;

    let formatRGBA: any;
    let formatRG: any;
    let formatR: any;

    if (isWebGL2) {
      formatRGBA = this.getSupportedFormat(
        gl,
        (gl as WebGL2RenderingContext).RGBA16F,
        gl.RGBA,
        halfFloatTexType
      );
      formatRG = this.getSupportedFormat(
        gl,
        (gl as WebGL2RenderingContext).RG16F,
        (gl as WebGL2RenderingContext).RG,
        halfFloatTexType
      );
      formatR = this.getSupportedFormat(
        gl,
        (gl as WebGL2RenderingContext).R16F,
        (gl as WebGL2RenderingContext).RED,
        halfFloatTexType
      );
    } else {
      formatRGBA = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return {
      gl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering,
      },
    };
  }

  private getSupportedFormat(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    internalFormat: number,
    format: number,
    type: number
  ): { internalFormat: number; format: number } | null {
    if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
      if ('drawBuffers' in gl) {
        const gl2 = gl as WebGL2RenderingContext;
        switch (internalFormat) {
          case gl2.R16F:
            return this.getSupportedFormat(gl2, gl2.RG16F, gl2.RG, type);
          case gl2.RG16F:
            return this.getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, type);
          default:
            return null;
        }
      }
      return null;
    }
    return { internalFormat, format };
  }

  private supportRenderTextureFormat(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    internalFormat: number,
    format: number,
    type: number
  ): boolean {
    const texture = gl.createTexture();
    if (!texture) return false;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    if (!fbo) return false;

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  private initializeShaders(): void {
    const baseVertexShader = this.compileShader(this.gl.VERTEX_SHADER, SHADERS.baseVertex);
    
    this.programs.clear = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.clear));
    this.programs.copy = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.copy));
    this.programs.splat = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.splat));
    this.programs.advection = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.advection));
    this.programs.divergence = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.divergence));
    this.programs.curl = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.curl));
    this.programs.vorticity = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.vorticity));
    this.programs.pressure = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.pressure));
    this.programs.gradientSubtract = new Program(this.gl, baseVertexShader, this.compileShader(this.gl.FRAGMENT_SHADER, SHADERS.gradientSubtract));

    this.displayMaterial = new Material(this.gl, baseVertexShader, SHADERS.display);
    
    this.initializeBlit();
  }

  private compileShader(type: number, source: string, keywords: string[] | null = null): WebGLShader | null {
    const shaderSource = this.addKeywords(source, keywords);
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    
    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  private addKeywords(source: string, keywords: string[] | null): string {
    if (!keywords) return source;
    let keywordsString = '';
    for (const keyword of keywords) {
      keywordsString += `#define ${keyword}\n`;
    }
    return keywordsString + source;
  }

  private initializeBlit(): void {
    const buffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      this.gl.STATIC_DRAW
    );
    
    const elemBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, elemBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      this.gl.STATIC_DRAW
    );
    
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);
  }

  private initFramebuffers(): void {
    const canvas = this.canvasRef.nativeElement;
    const simRes = this.getResolution(this.config.SIM_RESOLUTION);
    const dyeRes = this.getResolution(this.config.DYE_RESOLUTION);

    const texType = this.ext.halfFloatTexType;
    const rgba = this.ext.formatRGBA;
    const rg = this.ext.formatRG;
    const r = this.ext.formatR;
    const filtering = this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST;

    this.dye = this.createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    this.velocity = this.createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

    this.divergence = this.createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, this.gl.NEAREST);
    this.curl = this.createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, this.gl.NEAREST);
    this.pressure = this.createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, this.gl.NEAREST);

    this.blit = this.createBlitFunction();
  }

  private getResolution(resolution: number): { width: number; height: number } {
    const canvas = this.canvasRef.nativeElement;
    let aspectRatio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);

    if (this.gl.drawingBufferWidth > this.gl.drawingBufferHeight) {
      return { width: max, height: min };
    } else {
      return { width: min, height: max };
    }
  }

  private createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
    const texture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, param);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, param);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = this.gl.createFramebuffer()!;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0);
    this.gl.viewport(0, 0, w, h);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    const texelSizeX = 1.0 / w;
    const texelSizeY = 1.0 / h;

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      attach: (id: number) => {
        this.gl.activeTexture(this.gl.TEXTURE0 + id);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  private createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
    let fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = this.createFBO(w, h, internalFormat, format, type, param);

    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() { return fbo1; },
      set read(value) { fbo1 = value; },
      get write() { return fbo2; },
      set write(value) { fbo2 = value; },
      swap: () => {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      }
    };
  }

  private createBlitFunction(): (target: FBO | null, clear?: boolean) => void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.gl.createBuffer());
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);

    return (target: FBO | null, clear = false) => {
      if (target == null) {
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      } else {
        this.gl.viewport(0, 0, target.width, target.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      }
      this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    };
  }

  private updateKeywords(): void {
    let displayKeywords = [];
    if (this.config.SHADING) displayKeywords.push('SHADING');
    this.displayMaterial.setKeywords(displayKeywords);
  }

  private startAnimation(): void {
    const updateFrame = () => {
      const dt = this.calcDeltaTime();
      if (this.resizeCanvas()) this.initFramebuffers();
      this.updateColors(dt);
      this.applyInputs();
      if (!this.config.PAUSED) {
        this.step(dt);
      }
      this.render(null);
      
      this.animationId = requestAnimationFrame(updateFrame);
    };

    updateFrame();
  }

  private calcDeltaTime(): number {
    const now = Date.now();
    let dt = (now - this.lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    this.lastUpdateTime = now;
    return dt;
  }

  private resizeCanvas(): boolean {
    const canvas = this.canvasRef.nativeElement;
    const width = this.scaleByPixelRatio(canvas.clientWidth);
    const height = this.scaleByPixelRatio(canvas.clientHeight);
    
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  private scaleByPixelRatio(input: number): number {
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
  }

  private updateColors(dt: number): void {
    if (!this.config.COLOR_UPDATE_SPEED) return;
    
    this.colorUpdateTimer += dt * this.config.COLOR_UPDATE_SPEED;
    if (this.colorUpdateTimer >= 1) {
      this.colorUpdateTimer = this.wrap(this.colorUpdateTimer, 0, 1);
      this.pointers.forEach((p) => {
        p.color = this.generateColor();
      });
    }
  }

  private applyInputs(): void {
    for (const p of this.pointers) {
      if (p.moved) {
        p.moved = false;
        this.splatPointer(p);
      }
    }
  }

  private step(dt: number): void {
    this.gl.disable(this.gl.BLEND);

    this.programs.curl.bind(this.gl);
    this.gl.uniform2f(this.programs.curl.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    this.gl.uniform1i(this.programs.curl.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curl);

    this.programs.vorticity.bind(this.gl);
    this.gl.uniform2f(this.programs.vorticity.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    this.gl.uniform1i(this.programs.vorticity.uniforms.uVelocity, this.velocity.read.attach(0));
    this.gl.uniform1i(this.programs.vorticity.uniforms.uCurl, this.curl.attach(1));
    this.gl.uniform1f(this.programs.vorticity.uniforms.curl, this.config.CURL);
    this.gl.uniform1f(this.programs.vorticity.uniforms.dt, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    this.programs.divergence.bind(this.gl);
    this.gl.uniform2f(this.programs.divergence.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    this.gl.uniform1i(this.programs.divergence.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergence);

    this.programs.clear.bind(this.gl);
    this.gl.uniform1i(this.programs.clear.uniforms.uTexture, this.pressure.read.attach(0));
    this.gl.uniform1f(this.programs.clear.uniforms.value, this.config.PRESSURE);
    this.blit(this.pressure.write);
    this.pressure.swap();

    this.programs.pressure.bind(this.gl);
    this.gl.uniform2f(this.programs.pressure.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    this.gl.uniform1i(this.programs.pressure.uniforms.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
      this.gl.uniform1i(this.programs.pressure.uniforms.uPressure, this.pressure.read.attach(1));
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    this.programs.gradientSubtract.bind(this.gl);
    this.gl.uniform2f(this.programs.gradientSubtract.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    this.gl.uniform1i(this.programs.gradientSubtract.uniforms.uPressure, this.pressure.read.attach(0));
    this.gl.uniform1i(this.programs.gradientSubtract.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    this.programs.advection.bind(this.gl);
    this.gl.uniform2f(this.programs.advection.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    if (!this.ext.supportLinearFiltering) {
      this.gl.uniform2f(this.programs.advection.uniforms.dyeTexelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    }
    this.gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.attach(0));
    this.gl.uniform1i(this.programs.advection.uniforms.uSource, this.velocity.read.attach(0));
    this.gl.uniform1f(this.programs.advection.uniforms.dt, dt);
    this.gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
    this.blit(this.velocity.write);
    this.velocity.swap();

    this.gl.uniform2f(this.programs.advection.uniforms.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    if (!this.ext.supportLinearFiltering) {
      this.gl.uniform2f(this.programs.advection.uniforms.dyeTexelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    }
    this.gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.attach(0));
    this.gl.uniform1i(this.programs.advection.uniforms.uSource, this.dye.read.attach(1));
    this.gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private render(target: FBO | null): void {
    if (this.config.SHADING) {
      this.displayMaterial.setKeywords(['SHADING']);
    } else {
      this.displayMaterial.setKeywords([]);
    }

    this.displayMaterial.bind();
    if (!this.ext.supportLinearFiltering) {
      this.gl.uniform2f(this.displayMaterial.uniforms['texelSize'], this.dye.texelSizeX, this.dye.texelSizeY);
    }
    this.gl.uniform1i(this.displayMaterial.uniforms['uTexture'], this.dye.read.attach(0));
    if (this.config.SHADING) {
      this.gl.uniform2f(this.displayMaterial.uniforms['texelSize'], this.dye.texelSizeX, this.dye.texelSizeY);
    }
    this.blit(target);
  }

  private splat(x: number, y: number, dx: number, dy: number, color: ColorRGB): void {
    this.gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    this.programs.splat.bind(this.gl);
    this.gl.uniform1i(this.programs.splat.uniforms.uTarget, this.velocity.read.attach(0));
    this.gl.uniform1f(this.programs.splat.uniforms.aspectRatio, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight);
    this.gl.uniform2f(this.programs.splat.uniforms.point, x, y);
    this.gl.uniform3f(this.programs.splat.uniforms.color, dx, dy, 0.0);
    this.gl.uniform1f(this.programs.splat.uniforms.radius, this.correctRadius(this.config.SPLAT_RADIUS / 100.0));
    this.blit(this.velocity.write);
    this.velocity.swap();

    this.gl.viewport(0, 0, this.dye.width, this.dye.height);
    this.gl.uniform1i(this.programs.splat.uniforms.uTarget, this.dye.read.attach(0));
    this.gl.uniform3f(this.programs.splat.uniforms.color, color.r, color.g, color.b);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  private correctRadius(radius: number): number {
    const canvas = this.canvasRef.nativeElement;
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) {
      radius *= aspectRatio;
    }
    return radius;
  }

  private splatPointer(pointer: Pointer): void {
    const dx = pointer.deltaX * this.config.SPLAT_FORCE;
    const dy = pointer.deltaY * this.config.SPLAT_FORCE;
    this.splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
  }

  private generateColor(): ColorRGB {
    const c = this.HSVtoRGB(Math.random(), 1.0, 1.0);
    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    return c;
  }

  private HSVtoRGB(h: number, s: number, v: number): ColorRGB {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r, g, b };
  }

  private wrap(value: number, min: number, max: number): number {
    const range = max - min;
    if (range === 0) return min;
    return ((value - min) % range) + min;
  }

  private addEventListeners(): void {
    document.body.addEventListener('mousemove', this.firstMouseMoveHandler);
    document.body.addEventListener('touchstart', this.firstTouchStartHandler);
    
    window.addEventListener('mousedown', this.mouseDownHandler);
    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('touchstart', this.touchStartHandler, false);
    window.addEventListener('touchmove', this.touchMoveHandler, false);
    window.addEventListener('touchend', this.touchEndHandler);
  }

  private removeEventListeners(): void {
    document.body.removeEventListener('mousemove', this.firstMouseMoveHandler);
    document.body.removeEventListener('touchstart', this.firstTouchStartHandler);
    
    window.removeEventListener('mousedown', this.mouseDownHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('touchstart', this.touchStartHandler);
    window.removeEventListener('touchmove', this.touchMoveHandler);
    window.removeEventListener('touchend', this.touchEndHandler);
  }

  private onMouseDown(e: MouseEvent): void {
    const pointer = this.pointers[0];
    const posX = this.scaleByPixelRatio(e.clientX);
    const posY = this.scaleByPixelRatio(e.clientY);
    this.updatePointerDownData(pointer, -1, posX, posY);
    this.clickSplat(pointer);
  }

  private onMouseMove(e: MouseEvent): void {
    const pointer = this.pointers[0];
    const posX = this.scaleByPixelRatio(e.clientX);
    const posY = this.scaleByPixelRatio(e.clientY);
    this.updatePointerMoveData(pointer, posX, posY, pointer.color);
  }

  private onTouchStart(e: TouchEvent): void {
    const touches = e.targetTouches;
    const pointer = this.pointers[0];
    for (let i = 0; i < touches.length; i++) {
      const posX = this.scaleByPixelRatio(touches[i].clientX);
      const posY = this.scaleByPixelRatio(touches[i].clientY);
      this.updatePointerDownData(pointer, touches[i].identifier, posX, posY);
    }
  }

  private onTouchMove(e: TouchEvent): void {
    const touches = e.targetTouches;
    const pointer = this.pointers[0];
    for (let i = 0; i < touches.length; i++) {
      const posX = this.scaleByPixelRatio(touches[i].clientX);
      const posY = this.scaleByPixelRatio(touches[i].clientY);
      this.updatePointerMoveData(pointer, posX, posY, pointer.color);
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    const pointer = this.pointers[0];
    this.updatePointerUpData(pointer);
  }

  private handleFirstMouseMove(e: MouseEvent): void {
    const pointer = this.pointers[0];
    const posX = this.scaleByPixelRatio(e.clientX);
    const posY = this.scaleByPixelRatio(e.clientY);
    const color = this.generateColor();
    this.updatePointerMoveData(pointer, posX, posY, color);
    document.body.removeEventListener('mousemove', this.firstMouseMoveHandler);
  }

  private handleFirstTouchStart(e: TouchEvent): void {
    const touches = e.targetTouches;
    const pointer = this.pointers[0];
    for (let i = 0; i < touches.length; i++) {
      const posX = this.scaleByPixelRatio(touches[i].clientX);
      const posY = this.scaleByPixelRatio(touches[i].clientY);
      this.updatePointerDownData(pointer, touches[i].identifier, posX, posY);
    }
    document.body.removeEventListener('touchstart', this.firstTouchStartHandler);
  }

  private updatePointerDownData(pointer: Pointer, id: number, posX: number, posY: number): void {
    const canvas = this.canvasRef.nativeElement;
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1 - posY / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = this.generateColor();
  }

  private updatePointerMoveData(pointer: Pointer, posX: number, posY: number, color: ColorRGB): void {
    const canvas = this.canvasRef.nativeElement;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1 - posY / canvas.height;
    pointer.deltaX = this.correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = this.correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.color = color;
  }

  private updatePointerUpData(pointer: Pointer): void {
    pointer.down = false;
  }

  private correctDeltaX(delta: number): number {
    const canvas = this.canvasRef.nativeElement;
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }

  private correctDeltaY(delta: number): number {
    const canvas = this.canvasRef.nativeElement;
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }

  private clickSplat(pointer: Pointer): void {
    const color = this.generateColor();
    color.r *= 10;
    color.g *= 10;
    color.b *= 10;
    const dx = 10 * (Math.random() - 0.5);
    const dy = 30 * (Math.random() - 0.5);
    this.splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
  }

  private cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.removeEventListeners();
  }
} 