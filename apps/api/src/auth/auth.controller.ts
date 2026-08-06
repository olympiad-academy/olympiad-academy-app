import { BadRequestException, Body, Controller, HttpCode, Inject, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { contract } from "@olympiad-academy-app/contracts";
import { ZodError } from "zod";
import { AuthService } from "./auth.service.js";
import type { AuthResult } from "./auth.dto.js";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("signup")
  @HttpCode(200)
  @ApiOperation({ summary: "Create a new student account" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["name", "password"],
      properties: {
        name: { type: "string", example: "Ali" },
        password: { type: "string", minLength: 8, example: "securepass123" },
        language: { type: "string", enum: ["uz", "ru", "en"], default: "uz" },
        phone: { type: "string", nullable: true, example: "+998901234567" },
        email: { type: "string", format: "email", nullable: true, example: "ali@example.com" },
      },
      description: "At least one of phone or email is required",
    },
  })
  @ApiResponse({
    status: 200,
    description: "Account created successfully",
    schema: {
      type: "object",
      properties: {
        user_id: { type: "string", format: "uuid" },
        token: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid request body" })
  @ApiResponse({ status: 409, description: "Duplicate account — phone or email already exists" })
  public async signup(@Body() body: unknown): Promise<AuthResult> {
    const dto = this.parseBody(contract.signup.body, body);
    return this.authService.signup(dto);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Log in with phone/email and password" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["password"],
      properties: {
        password: { type: "string", minLength: 1, example: "securepass123" },
        phone: { type: "string", nullable: true, example: "+998901234567" },
        email: { type: "string", format: "email", nullable: true, example: "ali@example.com" },
      },
      description: "At least one of phone or email is required",
    },
  })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    schema: {
      type: "object",
      properties: {
        user_id: { type: "string", format: "uuid" },
        token: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid request body" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  public async login(@Body() body: unknown): Promise<AuthResult> {
    const dto = this.parseBody(contract.login.body, body);
    return this.authService.login(dto);
  }

  private parseBody<T>(schema: { parse: (v: unknown) => T }, body: unknown): T {
    try {
      return schema.parse(body);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.errors);
      }
      throw error;
    }
  }
}
