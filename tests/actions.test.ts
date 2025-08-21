
// tests/actions.test.ts

import { revalidatePath } from 'next/cache';
import { createPlotAction } from '../lib/actions';
import prisma from '../lib/db';

// Mock next/cache for revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock the prisma client, targeting the 'plot.create' method
jest.mock('../lib/db', () => ({
  __esModule: true,
  default: {
    plot: {
      create: jest.fn(),
    },
  },
}));

// A helper to typecast the mocked prisma client and revalidatePath
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedRevalidatePath = revalidatePath as jest.Mock;

describe('lib/actions.ts', () => {
  beforeEach(() => {
    // Reset all mocks before each test to ensure a clean state
    jest.resetAllMocks();
  });

  describe('createPlotAction (Refactored)', () => {
    it('should call prisma.plot.create and return success', async () => {
      // This test assumes you will refactor createPlotAction to use prisma directly.
      
      // Arrange
      const formData = new FormData();
      formData.append('name', 'New Farm Plot');
      formData.append('area', '25.5');
      formData.append('crop', 'Soybeans');

      const expectedPlotData = {
        name: 'New Farm Plot',
        area: 25.5,
        crop: 'Soybeans',
      };

      // Mock the successful creation in the database
      mockedPrisma.plot.create.mockResolvedValue({ id: 1, ...expectedPlotData, isArchived: false });

      // Act
      // NOTE: For this test to pass, you must refactor createPlotAction
      // to use `prisma.plot.create` instead of `fetch`.
      const result = await createPlotAction(null, formData);

      // Assert
      expect(result).toEqual({ success: true, error: null });
      
      // Verify that the database was called correctly
      expect(mockedPrisma.plot.create).toHaveBeenCalledWith({
        data: expectedPlotData,
      });
      expect(mockedPrisma.plot.create).toHaveBeenCalledTimes(1);

      // Verify that the cache was revalidated
      expect(mockedRevalidatePath).toHaveBeenCalledWith('/plots');
      expect(mockedRevalidatePath).toHaveBeenCalledTimes(1);
    });

    it('should return an error if prisma.plot.create fails', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('name', 'Duplicate Plot');
      formData.append('area', '10');
      formData.append('crop', 'Corn');

      const dbError = new Error('Database unique constraint failed');
      mockedPrisma.plot.create.mockRejectedValue(dbError);

      // Act
      const result = await createPlotAction(null, formData);

      // Assert
      // The action should catch the error and return it in a structured way.
      // You might need to adjust the error message based on your refactored error handling.
      expect(result).toEqual({ success: false, error: 'Database unique constraint failed' });
      
      // Verify that prisma was called but revalidation was not
      expect(mockedPrisma.plot.create).toHaveBeenCalledTimes(1);
      expect(mockedRevalidatePath).not.toHaveBeenCalled();
    });

    it('should return a validation error for invalid form data without calling prisma', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('name', ''); // Invalid name
      formData.append('area', '-10'); // Invalid area

      // Act
      const result = await createPlotAction(null, formData);

      // Assert
      expect(result).toEqual({ success: false, error: '请提供地块名称和有效的正数面积。' });
      
      // Crucially, ensure the database was NOT called
      expect(mockedPrisma.plot.create).not.toHaveBeenCalled();
      expect(mockedRevalidatePath).not.toHaveBeenCalled();
    });
  });
});
