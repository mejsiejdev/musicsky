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
import type * as AppMusicskyTempGetFeed from './getFeed.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'app.musicsky.temp.getComments'

export type QueryParams = {
  /** AT URI of the track to get comments for. */
  uri: string
  /** Maximum number of results. */
  limit?: number
  /** Pagination cursor. */
  cursor?: string
}
export type InputSchema = undefined

export interface OutputSchema {
  cursor?: string
  /** Total number of comments on this track. */
  totalCount: number
  comments: CommentView[]
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

export interface CommentView {
  $type?: 'app.musicsky.temp.getComments#commentView'
  uri: string
  cid: string
  text: string
  author: AppMusicskyTempGetFeed.AuthorView
  createdAt: string
  parent?: ParentRef
  deleted?: boolean
}

const hashCommentView = 'commentView'

export function isCommentView<V>(v: V) {
  return is$typed(v, id, hashCommentView)
}

export function validateCommentView<V>(v: V) {
  return validate<CommentView & V>(v, id, hashCommentView)
}

export interface ParentRef {
  $type?: 'app.musicsky.temp.getComments#parentRef'
  uri: string
  cid: string
}

const hashParentRef = 'parentRef'

export function isParentRef<V>(v: V) {
  return is$typed(v, id, hashParentRef)
}

export function validateParentRef<V>(v: V) {
  return validate<ParentRef & V>(v, id, hashParentRef)
}
