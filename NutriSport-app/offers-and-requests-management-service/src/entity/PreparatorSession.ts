// entities/Session.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Geometry, OneToOne, ManyToOne, PrimaryColumn } from 'typeorm';
import { Offer } from './Offer';
import { Devis } from './Devis';

@Entity('preparator_sessions')
export class PreparatorSession  {
  @PrimaryColumn()
  idSession: number;

  @Column()
  idPreparator: number;

  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  currentPosition: Geometry;
  
  @Column({ default: false })
  isActive: boolean;

  @Column({ type: "decimal", precision: 4, scale: 2, default: 0 })
  preparatorRank: number;

  @Column({nullable: true})
  fcmToken: string;

  @OneToMany(() => Offer, (offer) => offer.preparatorSession)
  offers: Offer[];

  @OneToMany(() => Devis, (devis) => devis.preparatorSession)
  devis: Devis[];
  
}
