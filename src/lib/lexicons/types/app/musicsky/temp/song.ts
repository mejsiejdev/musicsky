/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util'
import type * as ComAtprotoLabelDefs from '../../../com/atproto/label/defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.musicsky.temp.song'

export interface Main {
  $type: 'app.musicsky.temp.song'
  /** Title of the track. */
  title: string
  /** List of tags associated with the track. */
  tags?: string[]
  /** Optional description or notes about the track. */
  description?: string
  /** Genre label for the track. */
  genre?: string
  /** The audio file blob. Max 50 MB. */
  audio: BlobRef
  /** Cover art image. Max 10 MB. */
  coverArt: BlobRef
  /** Duration of the track in seconds. */
  duration: number
  labels?: $Typed<ComAtprotoLabelDefs.SelfLabels> | { $type: string }
  /** Client-declared timestamp of when the track was uploaded. */
  createdAt: string
  [k: string]: unknown
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain, true)
}

export {
  type Main as Record,
  isMain as isRecord,
  validateMain as validateRecord,
}
