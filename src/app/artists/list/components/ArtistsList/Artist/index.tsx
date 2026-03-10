import type { FC } from "react"

import styles from './styles.module.css'

import type { DBArtist } from "@/types/artists"


interface ArtistProps {
  artist: DBArtist
}

const ArtistListElement: FC<ArtistProps> = ({ artist }) => {
  const { name } = artist

  return <li className={styles.artist}>{name}</li>
}

export default ArtistListElement;
