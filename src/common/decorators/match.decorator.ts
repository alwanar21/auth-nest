import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsMatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: any) {
    const relatedPropertyName = args.constraints[0];
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: any) {
    return `Confirm Password must match ${args.constraints[0]}`;
  }
}

export function IsMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsMatchConstraint,
    });
  };
}
