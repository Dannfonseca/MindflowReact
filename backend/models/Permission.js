/*
  Arquivo: models/Permission.js
  Descrição: Novo Schema para armazenar as permissões de compartilhamento, definindo qual usuário tem acesso a qual mapa e com que permissão.
*/
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PermissionSchema = new Schema({
    map: {
        type: Schema.Types.ObjectId,
        ref: 'Map',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    grantedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permissionLevel: {
        type: String,
        enum: ['view', 'edit'],
        default: 'edit'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Índice para garantir que um usuário não seja convidado para o mesmo mapa duas vezes.
PermissionSchema.index({ map: 1, user: 1 }, { unique: true });

export default mongoose.model('Permission', PermissionSchema);