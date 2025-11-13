import { Component, effect, EventEmitter, input, OnInit, Output, signal, viewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Filter } from "./filter/filter";
import { MatIcon } from '@angular/material/icon';

const MATERIAL_MODULES=[MatTableModule,MatSortModule,MatPaginatorModule,MatIcon];
@Component({
  selector: 'app-grid',
  imports: [MATERIAL_MODULES, Filter],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid<T> implements OnInit {
  
  displayedColumns = input.required<string[]>();
  data = input.required<T[]>();
  sortableColumns=input<string[]>([]);

  columnLabels=input<Record<string,string>>({});

  dataSource = new MatTableDataSource<T>();
  valueToFilter=signal('');
  private readonly _sort= viewChild.required<MatSort>(MatSort);
  private readonly _paginator=viewChild.required<MatPaginator>(MatPaginator);

@Output() details = new EventEmitter<T>();


  ///
  @Output() edit = new EventEmitter<T>();
@Output() delete = new EventEmitter<T>();
  //

  constructor(){
    effect(()=> {
      //Efecto para el filtro
      if(this.valueToFilter()){
        this.dataSource.filter=this.valueToFilter();
      } else {
        this.dataSource.filter=''; 
      }

      //Efecto para actualizar los datos
      if(this.data()){
        this.dataSource.data=this.data();
      }

    },{allowSignalWrites:true})

    
  }

  ngOnInit(): void {
    this.dataSource.data=this.data();
    this.dataSource.sort=this._sort();
    this.dataSource.paginator=this._paginator();
  }
  

  applyFilter(event: Event):void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }
}
