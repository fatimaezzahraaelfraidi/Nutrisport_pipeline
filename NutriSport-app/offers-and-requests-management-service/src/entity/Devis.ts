import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, Double } from 'typeorm';
import { PreparatorSession } from './PreparatorSession';
import { Demand } from './Demand';
import { DevisStatus } from '../enum/EnumDevisStatus';

@Entity('devis')
export class Devis {
  @PrimaryGeneratedColumn()
  idDevis: number;

  @Column({ type: 'double precision' })
  proposed_price: Double;

  
  @Column({
    type: 'enum',
    enum: DevisStatus,
    default: DevisStatus.PENDING,
  })
  status: DevisStatus;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => PreparatorSession, (preparatorSession) => preparatorSession.devis)
  public preparatorSession: PreparatorSession;

  @ManyToOne(() => Demand, (demand) => demand.devis)
  public demand: Demand;


}
