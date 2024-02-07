import { Entity, PrimaryGeneratedColumn, ManyToOne, Column , CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { EnumMealType } from '../enum/EnumMealType';
import { SprotifSession } from './SportifSession';
import { Devis } from './Devis';

@Entity('demands')
export class Demand {
  @PrimaryGeneratedColumn()
  idDemand: number;

  @Column({ nullable: false })
  title: string;

  @Column({
    type: 'enum',
    enum: EnumMealType,
  })
  mealType: EnumMealType;
 
  @Column({ type: 'integer' })
  caloricValue: number;

  @Column('double precision')
  fatsValue: number;

  @Column('double precision')
  proteinValue: number;

  @Column('double precision')
  carbohydratesValue: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  desired_delivery_date: Date;

  @Column({default : true})
  isAvailable : boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => SprotifSession, (sprotifSession) => sprotifSession.demands)
  sportifSession: SprotifSession;

  @OneToMany(() => Devis, (devis) => devis.preparatorSession)
  devis: Devis[];
}
