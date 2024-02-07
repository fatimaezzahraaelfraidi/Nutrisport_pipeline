import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { OrderStatus } from '../enum/EnumOrderStatus';
import { Devis } from './Devis';
import { SportifSession } from './SportifSession';
import { Offer } from './Offer';

@Entity('orders')
export class Order {

  @PrimaryGeneratedColumn()
  idOrder: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PREPARATION
  })
  orderStatus: OrderStatus;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({default: false})
  isPaid: boolean;

  @OneToOne(() => Devis, devis => devis.order, { cascade: true, nullable: true })
  @JoinColumn()
  devis: Devis;

  @ManyToOne(() => SportifSession, SportifSession => SportifSession.orders)
  sportifSession: SportifSession;

  @ManyToOne(() => Offer, offer => offer.orders, {nullable: true})
  offer: Offer;
}
