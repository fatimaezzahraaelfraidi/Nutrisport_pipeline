import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Geometry, PrimaryColumn } from 'typeorm';
import { Demand } from './Demand';

@Entity('sportif_sessions')
export class SprotifSession  {
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

  @Column({ nullable: true})
  fcmToken: string; 

  @OneToMany(() => Demand, (demand) => demand.sportifSession)
  demands: Demand[];

}