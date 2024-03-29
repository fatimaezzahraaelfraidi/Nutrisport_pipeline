import { Entity, ManyToOne, Column, Double, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Order } from './Order';
import { PreparatorSession } from './PreparatorSession';

@Entity('devis')
export class Devis {
  @PrimaryColumn()
  idDevis: number;

  @Column({ type: 'double precision' })
  proposed_price: Double;

  @Column()
  idPreparator: number;

  @OneToOne(() => Order, order => order.devis)
  @JoinColumn()
  order: Order;

  @ManyToOne(() => PreparatorSession, (preparatorSession) => preparatorSession.devis)
  public preparatorSession: PreparatorSession;
  
  @Column({nullable:true})
  title:string;

  // @ManyToOne(() => SportifSession, (sportifSession) => sportifSession.devis)
  // sportifSession: SportifSession;
 
}
