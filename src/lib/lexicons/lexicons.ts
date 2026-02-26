/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type LexiconDoc,
  Lexicons,
  ValidationError,
  type ValidationResult,
} from '@atproto/lexicon'
import { type $Typed, is$typed, maybe$typed } from './util.js'

export const schemaDict = {
  AppMusicskyTempComment: {
    lexicon: 1,
    id: 'app.musicsky.temp.comment',
    defs: {
      main: {
        type: 'record',
        description:
          'Record representing a comment on a track, with optional threading via parent reference.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['text', 'subject', 'createdAt'],
          properties: {
            text: {
              type: 'string',
              minLength: 1,
              maxLength: 5000,
              maxGraphemes: 1000,
              description: 'The comment text.',
            },
            subject: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description: 'Strong reference to the track being commented on.',
            },
            parent: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'Optional strong reference to a parent comment for threading.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp of when the comment was created.',
            },
          },
        },
      },
    },
  },
  AppMusicskyTempLike: {
    lexicon: 1,
    id: 'app.musicsky.temp.like',
    defs: {
      main: {
        type: 'record',
        description: 'Record representing a like on a track.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['subject', 'createdAt'],
          properties: {
            subject: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description: 'Strong reference to the track being liked.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp of when the like was created.',
            },
          },
        },
      },
    },
  },
  AppMusicskyTempPlaylist: {
    lexicon: 1,
    id: 'app.musicsky.temp.playlist',
    defs: {
      main: {
        type: 'record',
        description: 'Record representing a user-curated playlist of tracks.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['name', 'tracks', 'createdAt'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 512,
              maxGraphemes: 100,
              description: 'Name of the playlist.',
            },
            description: {
              type: 'string',
              maxLength: 5000,
              maxGraphemes: 1000,
              description: 'Optional description of the playlist.',
            },
            tracks: {
              type: 'array',
              items: {
                type: 'ref',
                ref: 'lex:com.atproto.repo.strongRef',
              },
              maxLength: 500,
              description:
                'Ordered list of strong references to tracks. Max 500 tracks per playlist.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp of when the playlist was created.',
            },
          },
        },
      },
    },
  },
  AppMusicskyTempTrack: {
    lexicon: 1,
    id: 'app.musicsky.temp.track',
    defs: {
      main: {
        type: 'record',
        description: 'Record representing a music track uploaded by a user.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['title', 'audio', 'duration', 'createdAt'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 512,
              maxGraphemes: 100,
              description: 'Title of the track.',
            },
            description: {
              type: 'string',
              maxLength: 5000,
              maxGraphemes: 1000,
              description: 'Optional description or notes about the track.',
            },
            genre: {
              type: 'string',
              maxLength: 256,
              maxGraphemes: 64,
              description: 'Genre label for the track.',
            },
            audio: {
              type: 'blob',
              accept: [
                'audio/mpeg',
                'audio/ogg',
                'audio/wav',
                'audio/flac',
                'audio/aac',
                'audio/webm',
              ],
              maxSize: 52428800,
              description: 'The audio file blob. Max 50 MB.',
            },
            coverArt: {
              type: 'blob',
              accept: ['image/png', 'image/jpeg', 'image/webp'],
              maxSize: 1000000,
              description: 'Optional cover art image. Max 1 MB.',
            },
            duration: {
              type: 'integer',
              minimum: 1,
              description: 'Duration of the track in seconds.',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description:
                'Client-declared timestamp of when the track was uploaded.',
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === 'main' ? id : `${id}#${hash}`}" $type property`,
        ),
      }
}

export const ids = {
  AppMusicskyTempComment: 'app.musicsky.temp.comment',
  AppMusicskyTempLike: 'app.musicsky.temp.like',
  AppMusicskyTempPlaylist: 'app.musicsky.temp.playlist',
  AppMusicskyTempTrack: 'app.musicsky.temp.track',
} as const
