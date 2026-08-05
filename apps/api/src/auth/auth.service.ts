import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "../prisma.service.js";
import {
  DEFAULT_GRADE,
  DUPLICATE_ACCOUNT_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
  JWT_EXPIRY,
  PRISMA_UNIQUE_CONSTRAINT_CODE,
  SALT_ROUNDS,
} from "./auth.constants.js";
import type { AuthResult, LoginDto, SignupDto } from "./auth.dto.js";

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  public async signup(dto: SignupDto): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const email = dto.email?.trim().toLowerCase() ?? null;
    const phone = dto.phone?.trim() ?? null;

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          phone,
          email,
          password_hash: passwordHash,
          language: dto.language,
          // FLAG (D10): signup contract does not collect `grade` (§14 Screen 1),
          // but `users.grade` is NOT NULL. Defaulting to 5 (pilot Grade 5 per
          // §4.1/§4.2). Revisit when contract gains a grade field.
          grade: DEFAULT_GRADE,
        },
        select: { id: true },
      });

      const token = this.jwtService.sign({ sub: user.id }, { expiresIn: JWT_EXPIRY });

      return { user_id: user.id, token };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === PRISMA_UNIQUE_CONSTRAINT_CODE
      ) {
        throw new ConflictException(DUPLICATE_ACCOUNT_MESSAGE);
      }
      throw error;
    }
  }

  public async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email?.trim().toLowerCase() ?? null;
    const phone = dto.phone?.trim() ?? null;
    const where = phone ? { phone } : email ? { email } : null;

    if (!where) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const user = await this.prisma.user.findUnique({
      where,
      select: { id: true, password_hash: true },
    });

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);

    if (!passwordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const token = this.jwtService.sign({ sub: user.id }, { expiresIn: JWT_EXPIRY });

    return { user_id: user.id, token };
  }
}
