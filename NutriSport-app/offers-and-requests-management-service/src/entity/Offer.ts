import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, Geometry } from 'typeorm';
import { PreparatorSession } from './PreparatorSession';
import { EnumMealType } from '../enum/EnumMealType';

@Entity('offers')
 

export class Offer {
  @PrimaryGeneratedColumn()
  idOffer: number;

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

  @Column('double precision')
  price: number;

  @Column()
  preparation_time : number;

  @Column({default: true})
  isDeliverable: boolean;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'geometry', nullable: true, srid: 4326,spatialFeatureType: 'Polygon' })
  geographicalArea: Geometry; // Assuming GeoJSON structure for the geographical area

  @ManyToOne(() => PreparatorSession, (preparatorSession) => preparatorSession.offers)
  preparatorSession: PreparatorSession;
}
