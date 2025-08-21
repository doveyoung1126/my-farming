
// tests/data.test.ts

import prisma from '../lib/db';
import { getAllCycles, getCycleDetailsById, getPlotDetails, getPlots, getRecordsWithDetails } from '../lib/data';
import { getCycleFinancialSummary } from '../lib/utils';
import { CycleWithDetails } from '../lib/types';

// Mock the entire prisma client
jest.mock('../lib/db', () => ({
  __esModule: true,
  default: {
    plot: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    cycle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    record: {
      findMany: jest.fn(),
    },
    // Add other models here as you need to test them
  },
}));

// Mock the utils module
jest.mock('../lib/utils', () => ({
  getCycleFinancialSummary: jest.fn(),
}));


// A helper to typecast the mocked prisma client
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedGetCycleFinancialSummary = getCycleFinancialSummary as jest.Mock;


describe('lib/data.ts', () => {
  // Reset mocks before each test to ensure isolation
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getPlots', () => {
    it('should return a list of plots excluding archived ones by default', async () => {
      // Arrange: Define the data our mock will return
      const mockPlots = [
        { id: 1, name: 'Plot A', area: 10, isArchived: false, crop: 'Tomato' },
        { id: 2, name: 'Plot B', area: 15, isArchived: false, crop: 'Potato' },
      ];
      mockedPrisma.plot.findMany.mockResolvedValue(mockPlots);

      // Act: Call the function we are testing
      const plots = await getPlots();

      // Assert: Check if the function behaved as expected
      expect(plots).toEqual(mockPlots);
      expect(mockedPrisma.plot.findMany).toHaveBeenCalledWith({
        where: { isArchived: false },
      });
      expect(mockedPrisma.plot.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return all plots including archived ones when includeArchived is true', async () => {
      // Arrange
      const mockPlotsWithArchived = [
        { id: 1, name: 'Plot A', area: 10, isArchived: false, crop: 'Tomato' },
        { id: 3, name: 'Plot C', area: 20, isArchived: true, crop: 'Carrot' },
      ];
      mockedPrisma.plot.findMany.mockResolvedValue(mockPlotsWithArchived);

      // Act
      const plots = await getPlots(true);

      // Assert
      expect(plots).toEqual(mockPlotsWithArchived);
      expect(mockedPrisma.plot.findMany).toHaveBeenCalledWith({
        where: {},
      });
      expect(mockedPrisma.plot.findMany).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if prisma query fails', async () => {
      // Arrange: Configure the mock to simulate an error
      const errorMessage = 'Database connection failed';
      mockedPrisma.plot.findMany.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      // We expect the function to throw an error, so we wrap it in expect().toThrow()
      await expect(getPlots()).rejects.toThrow('无法获取地块数据');
    });
  });

  describe('getAllCycles', () => {
    const mockCycles = [
      { id: 1, crop: 'Tomato', activities: [] },
      { id: 2, crop: 'Potato', activities: [] },
    ] as unknown as CycleWithDetails[];

    it('should return cycles without financial summary by default', async () => {
      // Arrange
      mockedPrisma.cycle.findMany.mockResolvedValue(mockCycles);

      // Act
      const cycles = await getAllCycles();

      // Assert
      expect(cycles).toEqual(mockCycles);
      expect(mockedPrisma.cycle.findMany).toHaveBeenCalledTimes(1);
      expect(mockedGetCycleFinancialSummary).not.toHaveBeenCalled();
    });

    it('should return cycles with financial summary when includeSummary is true', async () => {
      // Arrange
      mockedPrisma.cycle.findMany.mockResolvedValue(mockCycles);
      const mockSummary = { totalIncome: 100, totalExpense: -50, netProfit: 50, roi: 100 };
      mockedGetCycleFinancialSummary.mockReturnValue(mockSummary);

      // Act
      const cycles = await getAllCycles(true);

      // Assert
      expect(cycles).toHaveLength(2);
      expect(cycles[0]).toHaveProperty('summary', mockSummary);
      expect(cycles[1]).toHaveProperty('summary', mockSummary);
      expect(mockedGetCycleFinancialSummary).toHaveBeenCalledTimes(2);
      expect(mockedGetCycleFinancialSummary).toHaveBeenCalledWith(mockCycles[0]);
      expect(mockedGetCycleFinancialSummary).toHaveBeenCalledWith(mockCycles[1]);
    });

    it('should throw an error if prisma query fails', async () => {
      // Arrange
      const errorMessage = 'Database error';
      mockedPrisma.cycle.findMany.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getAllCycles()).rejects.toThrow('无法获取周期数据');
    });
  });

  describe('getCycleDetailsById', () => {
    const mockCycle = { id: 1, crop: 'Tomato', activities: [] } as unknown as CycleWithDetails;
    const mockSummary = { totalIncome: 200, totalExpense: -100, netProfit: 100, roi: 100 };

    it('should return cycle details with summary if found', async () => {
      // Arrange
      mockedPrisma.cycle.findUnique.mockResolvedValue(mockCycle);
      mockedGetCycleFinancialSummary.mockReturnValue(mockSummary);

      // Act
      const cycle = await getCycleDetailsById(1);

      // Assert
      expect(cycle).not.toBeNull();
      expect(cycle).toHaveProperty('summary', mockSummary);
      expect(mockedPrisma.cycle.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object), // We don't need to test the complex include structure here
      });
      expect(mockedGetCycleFinancialSummary).toHaveBeenCalledWith(mockCycle);
    });

    it('should return null if cycle is not found', async () => {
      // Arrange
      mockedPrisma.cycle.findUnique.mockResolvedValue(null);

      // Act
      const cycle = await getCycleDetailsById(999);

      // Assert
      expect(cycle).toBeNull();
      expect(mockedPrisma.cycle.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: expect.any(Object),
      });
      expect(mockedGetCycleFinancialSummary).not.toHaveBeenCalled();
    });

    it('should throw an error if prisma query fails', async () => {
      // Arrange
      const errorMessage = 'Database error';
      mockedPrisma.cycle.findUnique.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getCycleDetailsById(1)).rejects.toThrow('无法获取周期详情');
    });
  });

  describe('getPlotDetails', () => {
    const mockPlot = { id: 1, name: 'Main Plot', area: 100, isArchived: false, crop: 'Various' };
    const mockCycles = [{ id: 101, plotId: 1, crop: 'Corn' }, { id: 102, plotId: 1, crop: 'Wheat' }] as unknown as CycleWithDetails[];
    const mockSummary = { totalIncome: 100, totalExpense: -50, netProfit: 50, roi: 100 };

    it('should return plot details with its cycles and their summaries', async () => {
      // Arrange
      mockedPrisma.plot.findUnique.mockResolvedValue(mockPlot);
      mockedPrisma.cycle.findMany.mockResolvedValue(mockCycles);
      mockedGetCycleFinancialSummary.mockReturnValue(mockSummary);

      // Act
      const result = await getPlotDetails(1);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.plot).toEqual(mockPlot);
      expect(result?.cycles).toHaveLength(2);
      expect(result?.cycles[0]).toHaveProperty('summary', mockSummary);
      expect(mockedPrisma.plot.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockedPrisma.cycle.findMany).toHaveBeenCalledWith({
        where: { plotId: 1 },
        include: expect.any(Object),
        orderBy: { startDate: 'desc' },
      });
      expect(mockedGetCycleFinancialSummary).toHaveBeenCalledTimes(2);
    });

    it('should return null if plot is not found', async () => {
      // Arrange
      mockedPrisma.plot.findUnique.mockResolvedValue(null);

      // Act
      const result = await getPlotDetails(999);

      // Assert
      expect(result).toBeNull();
      expect(mockedPrisma.plot.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(mockedPrisma.cycle.findMany).not.toHaveBeenCalled();
    });

    it('should throw an error if prisma query for plot fails', async () => {
      // Arrange
      mockedPrisma.plot.findUnique.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(getPlotDetails(1)).rejects.toThrow('无法获取地块详情');
    });

    it('should throw an error if prisma query for cycles fails', async () => {
      // Arrange
      mockedPrisma.plot.findUnique.mockResolvedValue(mockPlot);
      mockedPrisma.cycle.findMany.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(getPlotDetails(1)).rejects.toThrow('无法获取地块详情');
    });
  });

  describe('getRecordsWithDetails', () => {
    const mockRecords = [{ id: 1, amount: 100 }, { id: 2, amount: -50 }];

    it('should fetch all records when no date range is provided', async () => {
      // Arrange
      mockedPrisma.record.findMany.mockResolvedValue(mockRecords);

      // Act
      const records = await getRecordsWithDetails();

      // Assert
      expect(records).toEqual(mockRecords);
      expect(mockedPrisma.record.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { date: 'desc' },
      });
    });

    it('should apply date filtering when date range is provided', async () => {
      // Arrange
      mockedPrisma.record.findMany.mockResolvedValue(mockRecords);
      const dateRange = {
        from: new Date('2025-01-01'),
        to: new Date('2025-01-31'),
      };

      // Act
      await getRecordsWithDetails(dateRange);

      // Assert
      expect(mockedPrisma.record.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        include: expect.any(Object),
        orderBy: { date: 'desc' },
      });
    });

    it('should throw an error if prisma query fails', async () => {
      // Arrange
      mockedPrisma.record.findMany.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(getRecordsWithDetails()).rejects.toThrow('无法获取财务数据');
    });
  });
});
