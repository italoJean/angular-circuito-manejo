import { Component, computed, HostListener, inject, OnDestroy,  OnInit,  signal, } from '@angular/core';
import { ReporteService } from '../../../../core/services/reporte.service';
import Chart, { registerables } from 'chart.js/auto';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  imports: [DecimalPipe, CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics implements OnInit, OnDestroy {
  private readonly _reporteService = inject(ReporteService);

  // Mantenemos los datos en un signal privado para reactividad eficiente.
  private dashboardData = signal<any>(null);

  // Signal para detectar cambios de tamaño sin saturar el procesador.
  private screenWidth = signal<number>(window.innerWidth);

  // --- KPI COMPUTADOS (Reactividad Inteligente) ---
  // Usamos computed para que Angular SOLO recalcule si dashboardData cambia

  readonly totalRecaudado = computed(() => this._sumarRentabilidad((item) => item.montoTotal));

  readonly saldoPorCobrar = computed(() =>
    this._sumarRentabilidad((item) => item.montoPendiente || 0)
  );

  readonly totalMontoCancelado = computed(() =>
    this._sumarRentabilidad((item) => item.montoCancelado || 0)
  );

  clientesEnRiesgo = computed(
    () =>
      this.dashboardData()?.retencionClientes.find((r: any) => r.categoria === 'EN RIESGO')
        ?.cantidadClientes ?? 0
  );

  clientesEnAbandono = computed(
    () =>
      this.dashboardData()?.retencionClientes.find((r: any) => r.categoria === 'ABANDONO')
        ?.cantidadClientes ?? 0
  );

  // Cálculo de Porcentaje de Pérdida (KPI preventivo)
  readonly tasaCancelacion = computed(() => {
    const total = this.totalRecaudado() + this.saldoPorCobrar() + this.totalMontoCancelado();
    return total > 0 ? (this.totalMontoCancelado() / total) * 100 : 0;
  });

  readonly clientesRiesgoCritico = computed(() => {
    const retencion = this.dashboardData()?.retencionClientes || [];
    return {
      enRiesgo: retencion.find((r: any) => r.categoria === 'EN RIESGO')?.cantidadClientes ?? 0,
      abandono: retencion.find((r: any) => r.categoria === 'ABANDONO')?.cantidadClientes ?? 0,
    };
  });

  // GESTIÓN DE GRÁFICOS Y MEMORIA
  private readonly charts = new Map<string, Chart>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  // Siempre destruir gráficos al salir del componente para evitar fugas de memoria.
  ngOnDestroy(): void {
    // Destruir cada instancia de Chart.js para liberar el canvas del navegador.
    this.charts.forEach((chart) => chart.destroy());
    this.charts.clear();

    // Completar el Subject para cerrar todas las suscripciones de RxJS.
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Detecta el redimensionamiento para ajustar fuentes dinámicamente
  @HostListener('window:resize')
  onResize(): void {
    this.screenWidth.set(window.innerWidth);
    // Redibuja solo si ya existen datos
    const currentData = this.dashboardData();
    if (currentData) this.renderizarTodo(currentData);
  }

  // LÓGICA DE NEGOCIO

  cargarDatosDashboard(): void {
    this._reporteService
      .getDashboardData()
      .pipe(takeUntil(this.destroy$)) // Evita memory leaks si el usuario cambia de ruta rápido
      .subscribe({
        next: (res) => {
          this.dashboardData.set(res);
          this.renderizarTodo(res);
        },
        error: (err) => console.error('Error en el Dashboard:', err),
      });
  }

  private renderizarTodo(res: any): void {
    this.renderRentabilidad(res.rentabilidadPaquetes);
    this.renderUsoVehiculos(res.usoVehiculos);
    this.renderEstadosPago(res.estadosPago);
    this.renderRetencion(res.retencionClientes);
  }
  // MÉTODOS DE RENDERIZADO (ESPECÍFICOS)

  private renderRentabilidad(datos: any[]): void {
    const ctxId = 'chartRentabilidad';
    this._limpiarGrafico(ctxId);

    this.charts.set(
      ctxId,
      new Chart(ctxId, {
        type: 'doughnut',
        data: {
          labels: datos.map((d) => d.etiqueta),
          datasets: [
            {
              data: datos.map((d) => d.montoTotal), // Mantenemos el monto pagado para el tamaño de la dona
              backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Rentabilidad (Recaudado vs Pendiente)',
              font: { size: this.screenWidth() < 600 ? 14 : 18 },
            },
            legend: {
              position: 'bottom',
              labels: { usePointStyle: true, font: { size: this.screenWidth() < 600 ? 10 : 12 } },
            },
            tooltip: {
              callbacks: {
                // MEJORA: El tooltip ahora muestra un desglose completo
                label: (ctx: any) => {
                  const item = datos[ctx.dataIndex];
                  const pagado = item.montoTotal;
                  const pendiente = item.montoPendiente;
                  return [
                    ` Pagado: $${pagado}`,
                    ` Pendiente: $${pendiente}`,
                    ` Clientes: ${item.totalClientes}`,
                  ];
                },
              },
            },
          },
        },
      })
    );
  }

  private renderUsoVehiculos(datos: any[]): void {
    const ctxId = 'chartUsoVehiculos';
    this._limpiarGrafico(ctxId);
    const isMobile = this.screenWidth() < 600;

    this.charts.set(
      ctxId,
      new Chart(ctxId, {
        type: 'bar',
        data: {
          labels: datos.map((d) => d.etiqueta),
          datasets: [
            {
              label: 'Total Reservas',
              data: datos.map((d) => d.totalReservas),
              backgroundColor: '#1cc88a',
              yAxisID: 'y',
            },
            {
              label: 'Minutos Utilizados',
              data: datos.map((d) => d.totalMinutos),
              backgroundColor: '#4e73df',
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Uso de Vehículos', font: { size: isMobile ? 14 : 18 } },
            legend: { position: 'bottom', labels: { font: { size: 10 }, usePointStyle: true } },
          },
          scales: {
            y: {
              position: 'left',
              title: { display: true, text: 'Cant. Reservas', font: { size: isMobile ? 10 : 12 } },
              ticks: { font: { size: isMobile ? 8 : 12 } },
            },
            y1: {
              position: 'right',
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Minutos Totales', font: { size: isMobile ? 10 : 12 } },
              ticks: { font: { size: isMobile ? 8 : 12 } },
            },
            x: { ticks: { font: { size: isMobile ? 8 : 12 }, maxRotation: 45, minRotation: 45 } },
          },
        },
      })
    );
  }

  private renderEstadosPago(datos: any[]): void {
    const ctxId = 'chartEstadosPago';
    this._limpiarGrafico(ctxId);

    this.charts.set(
      ctxId,
      new Chart(ctxId, {
        type: 'pie',
        data: {
          labels: datos.map((d) => d.estado),
          datasets: [
            {
              label: 'Clientes',
              data: datos.map((d) => d.totalClientes),
              backgroundColor: ['#1cc88a', '#f6c23e', '#e74a3b', '#4e73df'],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Estado de Pagos de Clientes',
              font: { size: 16 },
            },
            legend: {
              position: 'bottom',
              labels: { padding: 20, font: { size: 12 }, usePointStyle: true },
            },
          },
        },
      })
    );
  }

  private renderRetencion(datos: any[]): void {
    const ctxId = 'chartRetencion';
    this._limpiarGrafico(ctxId);
    const isMobile = this.screenWidth() < 600;

    this.charts.set(
      ctxId,
      new Chart(ctxId, {
        type: 'bar',
        data: {
          labels: datos.map((d) => d.categoria),
          datasets: [
            {
              label: 'Estado de Clientes',
              data: datos.map((d) => d.cantidadClientes),
              backgroundColor: datos.map((d) =>
                d.categoria === 'ABANDONO'
                  ? '#e74a3b'
                  : d.categoria === 'EN RIESGO'
                  ? '#f6c23e'
                  : '#1cc88a'
              ),
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Análisis de Retención vs Abandono (Corte 30 días)',
              font: { size: isMobile ? 14 : 16 },
            },
            legend: {
              position: 'bottom',
              labels: { font: { size: isMobile ? 10 : 12 }, usePointStyle: true },
            },
            tooltip: {
              callbacks: {
                label: (ctx: any) =>
                  ` Clientes: ${ctx.raw} | Promedio: ${
                    datos[ctx.dataIndex].promedioDiasRetraso
                  } días`,
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: 'Cantidad de Clientes' },
              ticks: { font: { size: isMobile ? 9 : 12 } },
            },
            y: { ticks: { font: { size: isMobile ? 9 : 12 } } },
          },
        },
      })
    );
  }

  /**
   * Encapsula la suma de valores dentro de la rentabilidad para no repetir código en computed.
   */
  private _sumarRentabilidad(selector: (item: any) => number): number {
    const data = this.dashboardData()?.rentabilidadPaquetes || [];
    return data.reduce((acc: number, item: any) => acc + selector(item), 0);
  }

  /**
   * Destruye el gráfico anterior si existe para que Chart.js no genere superposición de datos.
   */
  private _limpiarGrafico(id: string): void {
    const chart = this.charts.get(id);
    if (chart) {
      chart.destroy();
      this.charts.delete(id);
    }
  }
}