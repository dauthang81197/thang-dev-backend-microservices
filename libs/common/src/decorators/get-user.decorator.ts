import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // Nếu có chỉ định property cụ thể (vd: @GetUser('id'))
        if (data) {
            return user?.[data];
        }

        // Trả về toàn bộ user object
        return user;
    },
);
