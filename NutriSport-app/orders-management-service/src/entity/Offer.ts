import { Entity, Column, CreateDateColumn, UpdateDateColumn, Geometry, OneToOne, JoinColumn, PrimaryColumn, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { PreparatorSession } from './PreparatorSession';


@Entity('offers')
export class Offer {
  @PrimaryColumn()
  idOffer: number;

  @Column({ nullable: false })
  title: string;

  @Column('double precision')
  price: number;

  @Column()
  preparation_time : number;

  @Column({default: true})
  isDeliverable: boolean;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'geometry', nullable: true, srid: 4326,spatialFeatureType: 'Polygon' })
  geographicalArea: Geometry; // Assuming GeoJSON structure for the geographical area

  @OneToOne(() => Order, order => order.devis, { nullable: true})
  @JoinColumn()
  orders: Order;

  @ManyToOne(() => PreparatorSession, (preparatorSession) => preparatorSession.offers)
  preparatorSession: PreparatorSession;
}
