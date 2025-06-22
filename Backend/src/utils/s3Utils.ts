import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({
    region: process.env.YC_REGION,
    endpoint: process.env.YC_ENDPOINT,
    credentials: {
        accessKeyId: process.env.YC_KEY_ID!,
        secretAccessKey: process.env.YC_SECRET!,
    },
    forcePathStyle: false,
});

const BUCKET = process.env.YC_BUCKET!;
const PUBLIC_URL = `https://${BUCKET}.storage.yandexcloud.net`;

export async function uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string
) {
    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read',
        })
    );
    return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromS3(key: string) {
    await s3.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        })
    );
}

export function getPublicUrl(key: string) {
    return `${PUBLIC_URL}/${key}`;
}
