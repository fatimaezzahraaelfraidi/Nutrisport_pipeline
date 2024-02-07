import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Geometry, PrimaryColumn } from 'typeorm';
import { Order } from './Order';
import { Devis } from './Devis';

@Entity('sportif_sessions')
export class SportifSession  {
  @PrimaryColumn()
  idSession: number;
  
  @Column()
  idSportif: number;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  currentPosition: Geometry;
  
  @Column({nullable:true})
  name: String

  @Column({nullable:true})
  phone: String

  @Column({ default: false })
  isActive: boolean; 

  @Column({nullable: true})
  fcmToken: string;

  @OneToMany(() => Order, order => order.sportifSession)
  orders: Order[];

  // @OneToMany(() => Devis, (devis) => devis.sportifSession)
  // devis: Devis[];

}