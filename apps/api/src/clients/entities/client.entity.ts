import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'full_name', length: 255 })
  fullName!: string

  @Column({ length: 11, unique: true })
  cpf!: string

  @Column({ length: 255, unique: true })
  email!: string

  @Column({ name: 'favorite_color', length: 32 })
  favoriteColor!: string

  @Column({ type: 'text', nullable: true })
  notes!: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
