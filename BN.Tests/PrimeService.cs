using System;

namespace BN.Tests
{
    internal class PrimeService
    {
        public PrimeService()
        {
        }

        internal bool IsPrime(int candidate)
        {
            if (candidate == 1)
            {
                return false;
            }
            if (candidate < 2)
            {
                return false;
            }
            throw new NotImplementedException();
        }
    }
}