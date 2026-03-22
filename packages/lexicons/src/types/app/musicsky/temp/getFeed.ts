/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { HeadersMap, XRPCError } from '@atproto/xrpc'
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.musicsky.temp.getFeed'

export type QueryParams = {
  /** Maximum number of results. */
  limit?: number
  /** Pagination cursor. */
  cursor?: string
  /** DID of the viewing user for viewer state. */
  viewer?: string
}
export type InputSchema = undefined

export interface OutputSchema {
  cursor?: string
  songs: SongView[]
}

export interface CallOptions {
  signal?: AbortSignal
  headers?: HeadersMap
}

export interface Response {
  success: boolean
  headers: HeadersMap
  data: OutputSchema
}

export function toKnownErr(e: any) {
  return e
}

export interface SongView {
  $type?: 'app.musicsky.temp.getFeed#songView'
  uri: string
  cid: string
  author: AuthorView
  record: { [_ in string]: unknown }
  likeCount?: number
  repostCount?: number
  viewer?: ViewerState
  indexedAt: string
  createdAt?: string
}

const hashSongView = 'songView'

export function isSongView<V>(v: V) {
  return is$typed(v, id, hashSongView)
}

export function validateSongView<V>(v: V) {
  return validate<SongView & V>(v, id, hashSongView)
}

export interface AuthorView {
  $type?: 'app.musicsky.temp.getFeed#authorView'
  did: string
  handle: string
  pds: string
}

const hashAuthorView = 'authorView'

export function isAuthorView<V>(v: V) {
  return is$typed(v, id, hashAuthorView)
}

export function validateAuthorView<V>(v: V) {
  return validate<AuthorView & V>(v, id, hashAuthorView)
}

export interface ViewerState {
  $type?: 'app.musicsky.temp.getFeed#viewerState'
  like?: string
  repost?: string
}

const hashViewerState = 'viewerState'

export function isViewerState<V>(v: V) {
  return is$typed(v, id, hashViewerState)
}

export function validateViewerState<V>(v: V) {
  return validate<ViewerState & V>(v, id, hashViewerState)
}
