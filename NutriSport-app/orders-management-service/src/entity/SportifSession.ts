import { Entity, Column, OneToMany, Geometry, PrimaryColumn } from 'typeorm';
import { Order } from './Order';

@Entity('sportif_sessions')
export class SportifSession  {
  @PrimaryColumn()
  idSession: number;
  
  @Column()
  idSportif: number;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  currentPosition: Geometry;
  
  @Column({nullable:true})
  name: string

  @Column({nullable:true})
  phone: string

  @Column({ default: false })
  isActive: boolean; 

  @Column({nullable: true})
  fcmToken: string;

  @OneToMany(() => Order, order => order.sportifSession)
  orders: Order[];

  // @OneToMany(() => Devis, (devis) => devis.sportifSession)
  // devis: Devis[];

}